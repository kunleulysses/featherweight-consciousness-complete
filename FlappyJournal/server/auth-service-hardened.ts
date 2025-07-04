import { Express, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { memoryAuthStorage, User, CreateUserData } from './memory-auth-storage';

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  ),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshTokenSchema = z.object({
  refresh_token: z.string(),
});

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface UserInfo {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

interface JWTPayload {
  sub: string;
  email: string;
  username: string;
  roles: string[];
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export class HardenedAuthService {
  private privateKey: string;
  private publicKey: string;
  private jwtExpiry: string;
  private refreshTokenExpiry: string;
  private issuer: string;
  private audience: string;
  
  // In-memory store for refresh tokens (in production, use Redis or database)
  private refreshTokenStore: Map<string, { userId: string; expiresAt: Date }> = new Map();

  constructor() {
    // Load RSA keys
    const keysPath = path.join(process.cwd(), 'keys');
    this.privateKey = fs.readFileSync(path.join(keysPath, 'jwt-private.pem'), 'utf8');
    this.publicKey = fs.readFileSync(path.join(keysPath, 'jwt-public.pem'), 'utf8');
    
    // JWT configuration
    this.jwtExpiry = process.env.JWT_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';
    this.issuer = process.env.JWT_ISSUER || 'featherweight-auth';
    this.audience = process.env.JWT_AUDIENCE || 'featherweight-app';
    
    // Seed demo credentials
    this.seedDemoCredentials();
  }

  private async seedDemoCredentials(): Promise<void> {
    try {
      const demoEmail = 'demo@featherweight.world';
      const existingUser = await memoryAuthStorage.getUserByEmail(demoEmail);
      
      if (!existingUser) {
        const hashedPassword = await argon2.hash('demo123', {
          type: argon2.argon2id,
          memoryCost: 2 ** 16, // 64 MB
          timeCost: 3,
          parallelism: 1,
        });
        
        await memoryAuthStorage.createUser({
          username: 'demo',
          email: demoEmail,
          password: hashedPassword,
          firstName: 'Demo',
          lastName: 'User',
        });
        
        console.log('Demo credentials seeded: demo@featherweight.world / demo123');
      }
    } catch (error) {
      console.error('Failed to seed demo credentials:', error);
    }
  }

  private generateAccessToken(user: UserInfo): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles,
      iss: this.issuer,
      aud: this.audience,
    };

    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: this.jwtExpiry,
    });
  }

  private generateRefreshToken(): string {
    return jwt.sign(
      { type: 'refresh' },
      this.privateKey,
      {
        algorithm: 'RS256',
        expiresIn: this.refreshTokenExpiry,
        jwtid: `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }
    );
  }

  public verifyAccessToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
        issuer: this.issuer,
        audience: this.audience,
      }) as JWTPayload;
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  private verifyRefreshToken(token: string): boolean {
    try {
      const decoded = jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
      }) as any;
      
      return decoded.type === 'refresh' && this.refreshTokenStore.has(decoded.jti);
    } catch (error) {
      return false;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });
  }

  private async verifyPassword(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      return false;
    }
  }

  private setupSwagger(app: Express): void {
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Featherweight Auth API',
          version: '1.0.0',
          description: 'Hardened authentication service for Featherweight Journal',
        },
        servers: [
          {
            url: process.env.AUTH_BASE_URL || 'http://127.0.0.1:4001',
            description: 'Authentication service',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
      apis: [import.meta.url], // This file contains the route definitions
    };

    const specs = swaggerJsdoc(swaggerOptions);
    app.use('/auth/docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  setupRoutes(app: Express): void {
    // Setup OpenAPI documentation
    this.setupSwagger(app);

    /**
     * @swagger
     * /auth/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - username
     *               - email
     *               - password
     *             properties:
     *               username:
     *                 type: string
     *                 minLength: 3
     *                 maxLength: 50
     *               email:
     *                 type: string
     *                 format: email
     *               password:
     *                 type: string
     *                 minLength: 8
     *                 description: Must contain uppercase, lowercase, number, and special character
     *               firstName:
     *                 type: string
     *               lastName:
     *                 type: string
     *     responses:
     *       201:
     *         description: User registered successfully
     *       400:
     *         description: Validation error or user already exists
     *       500:
     *         description: Internal server error
     */
    app.post('/auth/register', async (req: Request, res: Response) => {
      try {
        const userData = registerSchema.parse(req.body);

        // Check if user already exists
        const existingUser = await memoryAuthStorage.getUserByEmail(userData.email);
        if (existingUser) {
          return res.status(400).json({
            error: 'User already exists',
            message: 'A user with this email already exists',
          });
        }

        // Hash password with argon2id
        const hashedPassword = await this.hashPassword(userData.password);

        // Create user
        const newUser = await memoryAuthStorage.createUser({
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
        });

        res.status(201).json({
          message: 'User registered successfully',
          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
          },
        });
      } catch (error: any) {
        console.error('Registration error:', error);
        
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            error: 'Validation error',
            details: error.errors,
          });
        }

        res.status(500).json({
          error: 'Registration failed',
          message: 'An unexpected error occurred',
        });
      }
    });

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Login user
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 user:
     *                   type: object
     *                 token:
     *                   type: string
     *                 expires_in:
     *                   type: number
     *       401:
     *         description: Invalid credentials
     *       500:
     *         description: Internal server error
     */
    app.post('/auth/login', async (req: Request, res: Response) => {
      try {
        const { email, password } = loginSchema.parse(req.body);

        // Get user from storage
        const user = await memoryAuthStorage.getUserByEmail(email);
        if (!user) {
          return res.status(401).json({
            error: 'Invalid credentials',
            message: 'Email or password is incorrect',
          });
        }

        // Verify password
        const isPasswordValid = await this.verifyPassword(user.password, password);
        if (!isPasswordValid) {
          return res.status(401).json({
            error: 'Invalid credentials',
            message: 'Email or password is incorrect',
          });
        }

        // Create user info object
        const userInfo: UserInfo = {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: ['user'], // Default role, can be extended
        };

        // Generate tokens
        const accessToken = this.generateAccessToken(userInfo);
        const refreshToken = this.generateRefreshToken();

        // Store refresh token
        const refreshTokenPayload = jwt.decode(refreshToken) as any;
        const expiresAt = new Date(refreshTokenPayload.exp * 1000);
        this.refreshTokenStore.set(refreshTokenPayload.jti, {
          userId: user.id,
          expiresAt,
        });

        // Set secure HTTP-only cookies
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict' as const,
          maxAge: 15 * 60 * 1000, // 15 minutes for access token
        };

        res.cookie('access_token', accessToken, cookieOptions);
        res.cookie('refresh_token', refreshToken, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
        });

        res.json({
          message: 'Login successful',
          user: userInfo,
          token: accessToken,
          expires_in: 900, // 15 minutes
        });
      } catch (error: any) {
        console.error('Login error:', error);
        
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            error: 'Validation error',
            details: error.errors,
          });
        }

        res.status(500).json({
          error: 'Login failed',
          message: 'An unexpected error occurred',
        });
      }
    });

    /**
     * @swagger
     * /auth/refresh:
     *   post:
     *     summary: Refresh access token
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               refresh_token:
     *                 type: string
     *                 description: Refresh token (optional if provided in cookie)
     *     responses:
     *       200:
     *         description: Token refreshed successfully
     *       401:
     *         description: Invalid or expired refresh token
     *       500:
     *         description: Internal server error
     */
    app.post('/auth/refresh', async (req: Request, res: Response) => {
      try {
        const refreshToken = req.cookies.refresh_token || req.body.refresh_token;
        
        if (!refreshToken) {
          return res.status(400).json({
            error: 'Missing refresh token',
            message: 'Refresh token is required',
          });
        }

        // Verify refresh token
        if (!this.verifyRefreshToken(refreshToken)) {
          return res.status(401).json({
            error: 'Invalid refresh token',
            message: 'Please log in again',
          });
        }

        const refreshPayload = jwt.decode(refreshToken) as any;
        const tokenData = this.refreshTokenStore.get(refreshPayload.jti);
        
        if (!tokenData || tokenData.expiresAt < new Date()) {
          this.refreshTokenStore.delete(refreshPayload.jti);
          return res.status(401).json({
            error: 'Expired refresh token',
            message: 'Please log in again',
          });
        }

        // Get user and generate new access token
        const user = await memoryAuthStorage.getUserById(tokenData.userId);
        if (!user) {
          return res.status(401).json({
            error: 'User not found',
            message: 'Please log in again',
          });
        }

        const userInfo: UserInfo = {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: ['user'],
        };

        const newAccessToken = this.generateAccessToken(userInfo);

        // Update access token cookie
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict' as const,
          maxAge: 15 * 60 * 1000, // 15 minutes
        };

        res.cookie('access_token', newAccessToken, cookieOptions);

        res.json({
          message: 'Token refreshed',
          token: newAccessToken,
          expires_in: 900,
        });
      } catch (error: any) {
        console.error('Token refresh error:', error);
        
        // Clear cookies on refresh failure
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        
        res.status(401).json({
          error: 'Token refresh failed',
          message: 'Please log in again',
        });
      }
    });

    /**
     * @swagger
     * /auth/logout:
     *   post:
     *     summary: Logout user
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Logout successful
     *       500:
     *         description: Internal server error
     */
    app.post('/auth/logout', async (req: Request, res: Response) => {
      try {
        const refreshToken = req.cookies.refresh_token;

        // Remove refresh token from store
        if (refreshToken) {
          try {
            const refreshPayload = jwt.decode(refreshToken) as any;
            if (refreshPayload?.jti) {
              this.refreshTokenStore.delete(refreshPayload.jti);
            }
          } catch (error) {
            console.error('Error removing refresh token:', error);
          }
        }

        // Clear cookies
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');

        res.json({ message: 'Logout successful' });
      } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
          error: 'Logout failed',
          message: 'An unexpected error occurred',
        });
      }
    });

    /**
     * @swagger
     * /auth/me:
     *   get:
     *     summary: Get current user information
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: User information retrieved successfully
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Internal server error
     */
    app.get('/auth/me', async (req: Request, res: Response) => {
      try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') 
          ? authHeader.substring(7) 
          : req.cookies.access_token;

        if (!token) {
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'Access token required',
          });
        }

        const payload = this.verifyAccessToken(token);
        if (!payload) {
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired token',
          });
        }

        // Get additional user data from storage
        const user = await memoryAuthStorage.getUserById(payload.sub);
        if (!user) {
          return res.status(401).json({
            error: 'User not found',
            message: 'Please log in again',
          });
        }

        res.json({
          id: payload.sub,
          email: payload.email,
          username: payload.username,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: payload.roles,
          isPremium: user.isPremium || false,
          premiumUntil: user.premiumUntil,
          preferences: user.preferences,
          createdAt: user.createdAt,
        });
      } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
          error: 'Failed to get user info',
          message: 'An unexpected error occurred',
        });
      }
    });

    /**
     * @swagger
     * /auth/health:
     *   get:
     *     summary: Health check endpoint
     *     tags: [Health]
     *     responses:
     *       200:
     *         description: Service is healthy
     */
    app.get('/auth/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'featherweight-auth',
        version: '1.0.0',
      });
    });
  }
}

export const hardenedAuthService = new HardenedAuthService();
