import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { expressjwt as expressJWT } from 'express-jwt';
import jwksClient from 'jwks-rsa';
import { promisify } from 'util';
import { config } from '../config';
import logger from '../utils/logger';

export interface JWTUser {
  sub: string; // User ID
  email: string;
  preferred_username: string;
  given_name?: string;
  family_name?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [clientId: string]: {
      roles: string[];
    };
  };
  // Custom project-level RBAC claims
  projects?: string[];
  project_roles?: string[];
  // Standard JWT claims
  iss: string;
  aud: string | string[];
  exp: number;
  iat: number;
  azp?: string;
}

export interface AuthenticatedRequest extends Request {
  user: JWTUser;
  auth?: JWTUser;
}

class AuthMiddleware {
  private jwksClient: jwksClient.JwksClient;
  private getSigningKey: (kid: string) => Promise<string>;

  constructor() {
    this.jwksClient = jwksClient({
      jwksUri: `${config.KEYCLOAK_SERVER_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/certs`,
      cache: true,
      cacheMaxAge: 1000 * 60 * 10, // 10 minutes
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });

    this.getSigningKey = promisify(this.jwksClient.getSigningKey.bind(this.jwksClient));
  }

  private async verifyToken(token: string): Promise<JWTUser> {
    return new Promise((resolve, reject) => {
      // For development/testing, allow a simple secret-based JWT verification fallback
      if (config.NODE_ENV === 'development' && !token.includes('.')) {
        // This is just for testing - in production, always use proper JWKS
        const mockUser: JWTUser = {
          sub: 'test-user-123',
          email: 'test@example.com',
          preferred_username: 'testuser',
          realm_access: { roles: ['user'] },
          iss: `${config.KEYCLOAK_SERVER_URL}/realms/${config.KEYCLOAK_REALM}`,
          aud: 'featherweight-app',
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
        };
        resolve(mockUser);
        return;
      }

      jwt.verify(
        token,
        async (header, callback) => {
          try {
            const key = await this.getSigningKey(header.kid);
            const signingKey = 'publicKey' in key ? key.publicKey : key.rsaPublicKey;
            callback(null, signingKey);
          } catch (error) {
            // Fallback to simple secret verification for development
            if (config.NODE_ENV === 'development') {
              callback(null, config.JWT_SECRET);
            } else {
              callback(error);
            }
          }
        },
        {
          audience: [
            'featherweight-app',
            'featherweight-frontend',
            'account',
          ],
          issuer: `${config.KEYCLOAK_SERVER_URL}/realms/${config.KEYCLOAK_REALM}`,
          algorithms: ['RS256', 'HS256'],
        },
        (error, decoded) => {
          if (error) {
            reject(error);
          } else {
            resolve(decoded as JWTUser);
          }
        }
      );
    });
  }

  // Express-JWT middleware wrapper
  expressJWTAuth = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          logger.warn('Express-JWT authentication failed: Missing or invalid authorization header', {
            ip: req.ip,
            path: req.path,
            userAgent: req.get('User-Agent')
          });
          
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or missing Authorization Bearer token',
            timestamp: new Date().toISOString(),
          });
        }

        const token = authHeader.substring(7);
        const user = await this.verifyToken(token);
        
        // Check if token is expired
        if (user.exp * 1000 < Date.now()) {
          return res.status(401).json({
            error: 'Token Expired',
            message: 'JWT token has expired',
            timestamp: new Date().toISOString(),
          });
        }
        
        // Inject user information into downstream headers
        req.headers['x-user-id'] = user.sub;
        req.headers['x-user-email'] = user.email;
        req.headers['x-user-roles'] = JSON.stringify(user.realm_access?.roles || []);
        
        // Inject project information if available
        if (user.projects && user.projects.length > 0) {
          req.headers['x-user-projects'] = JSON.stringify(user.projects);
        }
        
        if (user.project_roles && user.project_roles.length > 0) {
          req.headers['x-user-project-roles'] = JSON.stringify(user.project_roles);
        }

        (req as AuthenticatedRequest).user = user;
        (req as any).auth = user; // For express-jwt compatibility
        
        logger.info('User authenticated successfully via express-jwt', {
          userId: user.sub,
          email: user.email,
          path: req.path,
          method: req.method
        });

        next();
      } catch (error) {
        logger.error('Express-JWT authentication failed', {
          error: error.message,
          ip: req.ip,
          path: req.path,
          userAgent: req.get('User-Agent')
        });
        
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid token',
          timestamp: new Date().toISOString(),
        });
      }
    };
  };

  // Main authentication middleware (legacy, but keeping for compatibility)
  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn('Missing or invalid authorization header', { 
          ip: req.ip,
          path: req.path,
          userAgent: req.get('User-Agent')
        });
        
        res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Missing or invalid authorization header' 
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const user = await this.verifyToken(token);

      // Check if token is expired
      if (user.exp * 1000 < Date.now()) {
        logger.warn('Expired token used', { 
          userId: user.sub,
          exp: user.exp,
          ip: req.ip 
        });
        
        res.status(401).json({ 
          error: 'Token Expired', 
          message: 'JWT token has expired' 
        });
        return;
      }

      // Inject user information into downstream headers
      req.headers['x-user-id'] = user.sub;
      req.headers['x-user-email'] = user.email;
      req.headers['x-user-roles'] = JSON.stringify(user.realm_access?.roles || []);
      
      // Inject project information if available
      if (user.projects && user.projects.length > 0) {
        req.headers['x-user-projects'] = JSON.stringify(user.projects);
      }
      
      if (user.project_roles && user.project_roles.length > 0) {
        req.headers['x-user-project-roles'] = JSON.stringify(user.project_roles);
      }

      (req as AuthenticatedRequest).user = user;
      
      logger.info('User authenticated successfully', { 
        userId: user.sub,
        email: user.email,
        path: req.path,
        method: req.method
      });
      
      next();
    } catch (error) {
      logger.error('JWT verification failed', { 
        error: error.message,
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent')
      });
      
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid token' 
      });
    }
  };

  // Optional authentication - doesn't fail if no token
  optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const user = await this.verifyToken(token);
        
        if (user.exp * 1000 >= Date.now()) {
          // Inject user information into downstream headers
          req.headers['x-user-id'] = user.sub;
          req.headers['x-user-email'] = user.email;
          req.headers['x-user-roles'] = JSON.stringify(user.realm_access?.roles || []);
          
          if (user.projects && user.projects.length > 0) {
            req.headers['x-user-projects'] = JSON.stringify(user.projects);
          }
          
          if (user.project_roles && user.project_roles.length > 0) {
            req.headers['x-user-project-roles'] = JSON.stringify(user.project_roles);
          }
          
          (req as AuthenticatedRequest).user = user;
          
          logger.info('Optional authentication successful', { 
            userId: user.sub,
            email: user.email,
            path: req.path,
            method: req.method
          });
        }
      }
      
      next();
    } catch (error) {
      logger.warn('Optional authentication failed, continuing without auth', { 
        error: error.message,
        ip: req.ip,
        path: req.path
      });
      
      // Continue without authentication for optional routes
      next();
    }
  };

  // Role-based authorization middleware
  requireRole = (role: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as AuthenticatedRequest).user;
      
      if (!user) {
        logger.warn('Unauthorized access attempt to protected route', { 
          path: req.path,
          ip: req.ip,
          requiredRole: role
        });
        
        res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
        return;
      }

      const hasRole = user.realm_access?.roles.includes(role) ||
                     Object.values(user.resource_access || {})
                       .some(resource => resource.roles.includes(role));

      if (!hasRole) {
        logger.warn('Forbidden access attempt', { 
          userId: user.sub,
          path: req.path,
          requiredRole: role,
          userRoles: user.realm_access?.roles || []
        });
        
        res.status(403).json({ 
          error: 'Forbidden', 
          message: `Required role: ${role}` 
        });
        return;
      }

      next();
    };
  };

  // Project-level authorization
  requireProjectAccess = (projectId?: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as AuthenticatedRequest).user;
      
      if (!user) {
        res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
        return;
      }

      // Extract project ID from params if not provided
      const targetProjectId = projectId || req.params.projectId;
      
      if (!targetProjectId) {
        logger.warn('Project ID not found in request', { 
          userId: user.sub,
          path: req.path,
          params: req.params
        });
        
        res.status(400).json({ 
          error: 'Bad Request', 
          message: 'Project ID required' 
        });
        return;
      }

      if (!user.projects?.includes(targetProjectId)) {
        logger.warn('Forbidden project access attempt', { 
          userId: user.sub,
          path: req.path,
          projectId: targetProjectId,
          userProjects: user.projects || []
        });
        
        res.status(403).json({ 
          error: 'Forbidden', 
          message: `No access to project: ${targetProjectId}` 
        });
        return;
      }

      // Inject project scope into downstream headers
      req.headers['x-project-id'] = targetProjectId;
      
      next();
    };
  };
}

// Export singleton instance
export const authMiddleware = new AuthMiddleware();

// Export middleware functions
export const authenticate = authMiddleware.authenticate;
export const expressJWTAuth = authMiddleware.expressJWTAuth;
export const optionalAuth = authMiddleware.optionalAuth;
export const requireRole = authMiddleware.requireRole;
export const requireProjectAccess = authMiddleware.requireProjectAccess;
