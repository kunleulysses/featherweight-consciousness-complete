import { Express, Request, Response } from 'express';
import axios from 'axios';
import { z } from 'zod';
import { KeycloakAdminClient } from '../auth-service/keycloak-config';
import { storage } from './storage';
import { emailService } from './email';
import { authenticate, optionalAuth, requireAdmin, AuthenticatedRequest } from './auth-middleware';

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
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

const socialLoginSchema = z.object({
  provider: z.enum(['google', 'github', 'facebook']),
  code: z.string(),
  state: z.string().optional(),
});

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

interface UserInfo {
  sub: string;
  email: string;
  preferred_username: string;
  given_name?: string;
  family_name?: string;
  email_verified?: boolean;
}

export class AuthService {
  private keycloakUrl: string;
  private realm: string;
  private clientId: string;
  private clientSecret: string;
  private adminClient: KeycloakAdminClient;

  constructor() {
    this.keycloakUrl = process.env.KEYCLOAK_SERVER_URL || 'http://localhost:8080';
    this.realm = process.env.KEYCLOAK_REALM || 'featherweight';
    this.clientId = process.env.KEYCLOAK_CLIENT_ID || 'featherweight-app';
    this.clientSecret = process.env.KEYCLOAK_CLIENT_SECRET || '';

    this.adminClient = new KeycloakAdminClient({
      serverUrl: this.keycloakUrl,
      realm: this.realm,
      clientId: this.clientId,
      adminUsername: process.env.KEYCLOAK_ADMIN || 'admin',
      adminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin-secret-password',
    });
  }

  private async exchangeCodeForToken(email: string, password: string): Promise<TokenResponse> {
    const tokenUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'password',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        username: email,
        password: password,
        scope: 'openid profile email',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  }

  private async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    const tokenUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  }

  private async getUserInfo(accessToken: string): Promise<UserInfo> {
    const userInfoUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`;
    
    const response = await axios.get(userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return response.data;
  }

  private async syncUserToDatabase(keycloakUser: UserInfo): Promise<void> {
    try {
      // Check if user exists in our database
      const existingUser = await storage.getUserByEmail(keycloakUser.email);
      
      if (!existingUser) {
        // Create user in our database
        await storage.createUser({
          username: keycloakUser.preferred_username,
          email: keycloakUser.email,
          password: 'keycloak-managed', // Placeholder since Keycloak manages passwords
          firstName: keycloakUser.given_name,
          lastName: keycloakUser.family_name,
        });
      } else {
        // Update user information
        await storage.updateUser(existingUser.id, {
          username: keycloakUser.preferred_username,
          firstName: keycloakUser.given_name,
          lastName: keycloakUser.family_name,
        });
      }
    } catch (error) {
      console.error('Failed to sync user to database:', error);
      // Don't throw error - authentication can still proceed
    }
  }

  setupRoutes(app: Express): void {
    // Registration endpoint
    app.post('/auth/register', async (req: Request, res: Response) => {
      try {
        const userData = registerSchema.parse(req.body);

        // Check if user already exists in Keycloak
        const existingUser = await this.adminClient.getUserByEmail(userData.email);
        if (existingUser) {
          return res.status(400).json({
            error: 'User already exists',
            message: 'A user with this email already exists',
          });
        }

        // Create user in Keycloak
        const keycloakUserId = await this.adminClient.createUser({
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          enabled: true,
          emailVerified: false,
          credentials: [
            {
              type: 'password',
              value: userData.password,
              temporary: false,
            },
          ],
        });

        // Assign default user role
        await this.adminClient.assignRealmRoleToUser(keycloakUserId, 'user');

        // Send verification email
        // Note: This would typically be handled by Keycloak's email service
        
        // Create user in our database
        await storage.createUser({
          username: userData.username,
          email: userData.email,
          password: 'keycloak-managed',
          firstName: userData.firstName,
          lastName: userData.lastName,
        });

        // Send welcome email
        try {
          const dbUser = await storage.getUserByEmail(userData.email);
          if (dbUser) {
            await emailService.sendFlappyEmail(dbUser, 'dailyInspiration', 'welcome');
          }
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }

        res.status(201).json({
          message: 'User created successfully',
          userId: keycloakUserId,
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
          message: error.message || 'An unexpected error occurred',
        });
      }
    });

    // Login endpoint
    app.post('/auth/login', async (req: Request, res: Response) => {
      try {
        const { email, password } = loginSchema.parse(req.body);

        // Authenticate with Keycloak
        const tokenResponse = await this.exchangeCodeForToken(email, password);
        
        // Get user info
        const userInfo = await this.getUserInfo(tokenResponse.access_token);
        
        // Sync user to our database
        await this.syncUserToDatabase(userInfo);

        // Set secure HTTP-only cookies for tokens
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict' as const,
          maxAge: tokenResponse.expires_in * 1000,
        };

        res.cookie('access_token', tokenResponse.access_token, cookieOptions);
        res.cookie('refresh_token', tokenResponse.refresh_token, {
          ...cookieOptions,
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        res.json({
          message: 'Login successful',
          user: {
            id: userInfo.sub,
            email: userInfo.email,
            username: userInfo.preferred_username,
            firstName: userInfo.given_name,
            lastName: userInfo.family_name,
          },
          token: tokenResponse.access_token,
          expires_in: tokenResponse.expires_in,
        });
      } catch (error: any) {
        console.error('Login error:', error);
        
        if (error.response?.status === 401) {
          return res.status(401).json({
            error: 'Invalid credentials',
            message: 'Email or password is incorrect',
          });
        }

        res.status(500).json({
          error: 'Login failed',
          message: 'An unexpected error occurred',
        });
      }
    });

    // Token refresh endpoint
    app.post('/auth/refresh', async (req: Request, res: Response) => {
      try {
        const refreshToken = req.cookies.refresh_token || req.body.refresh_token;
        
        if (!refreshToken) {
          return res.status(400).json({
            error: 'Missing refresh token',
            message: 'Refresh token is required',
          });
        }

        const tokenResponse = await this.refreshAccessToken(refreshToken);
        
        // Update cookies
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict' as const,
          maxAge: tokenResponse.expires_in * 1000,
        };

        res.cookie('access_token', tokenResponse.access_token, cookieOptions);
        if (tokenResponse.refresh_token) {
          res.cookie('refresh_token', tokenResponse.refresh_token, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          });
        }

        res.json({
          message: 'Token refreshed',
          token: tokenResponse.access_token,
          expires_in: tokenResponse.expires_in,
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

    // Logout endpoint
    app.post('/auth/logout', authenticate, async (req: Request, res: Response) => {
      try {
        const user = (req as AuthenticatedRequest).user;
        const refreshToken = req.cookies.refresh_token;

        // Logout from Keycloak if refresh token is available
        if (refreshToken) {
          const logoutUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/logout`;
          
          try {
            await axios.post(
              logoutUrl,
              new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                refresh_token: refreshToken,
              }),
              {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
              }
            );
          } catch (error) {
            console.error('Keycloak logout error:', error);
            // Continue with local logout even if Keycloak logout fails
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

    // Get current user info
    app.get('/auth/me', authenticate, async (req: Request, res: Response) => {
      try {
        const user = (req as AuthenticatedRequest).user;
        
        // Get additional user data from our database
        const dbUser = await storage.getUserByEmail(user.email);
        
        res.json({
          id: user.sub,
          email: user.email,
          username: user.preferred_username,
          firstName: user.given_name,
          lastName: user.family_name,
          roles: user.realm_access?.roles || [],
          projects: user.projects || [],
          projectRoles: user.project_roles || [],
          // Include data from our database
          ...(dbUser && {
            isPremium: dbUser.isPremium,
            premiumUntil: dbUser.premiumUntil,
            preferences: dbUser.preferences,
            createdAt: dbUser.createdAt,
          }),
        });
      } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
          error: 'Failed to get user info',
          message: 'An unexpected error occurred',
        });
      }
    });

    // Admin: User management endpoints
    app.get('/auth/admin/users', requireAdmin, async (req: Request, res: Response) => {
      try {
        // This would typically implement pagination, filtering, etc.
        // For now, return a basic response
        res.json({
          message: 'Admin user management endpoint',
          note: 'This endpoint would return user list with proper pagination',
        });
      } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).json({
          error: 'Failed to get users',
          message: 'An unexpected error occurred',
        });
      }
    });

    // Social login endpoints (placeholder)
    app.get('/auth/social/:provider', (req: Request, res: Response) => {
      const { provider } = req.params;
      const redirectUri = encodeURIComponent(`${req.protocol}://${req.get('host')}/auth/social/${provider}/callback`);
      
      // Redirect to Keycloak social login
      const authUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/auth?client_id=${this.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid+profile+email&kc_idp_hint=${provider}`;
      
      res.redirect(authUrl);
    });

    app.get('/auth/social/:provider/callback', async (req: Request, res: Response) => {
      // Handle social login callback
      // This would exchange the authorization code for tokens
      res.json({
        message: 'Social login callback',
        note: 'This would complete the social login flow',
      });
    });
  }
}

export const authService = new AuthService();
