import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { promisify } from 'util';

export interface JWTUser {
  sub: string; // Keycloak user ID
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
}

class AuthMiddleware {
  private jwksClient: jwksClient.JwksClient;
  private getSigningKey: (kid: string) => Promise<string>;

  constructor() {
    const keycloakUrl = process.env.KEYCLOAK_SERVER_URL || 'http://localhost:8080';
    const realm = process.env.KEYCLOAK_REALM || 'featherweight';
    
    this.jwksClient = jwksClient({
      jwksUri: `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`,
      cache: true,
      cacheMaxAge: 1000 * 60 * 10, // 10 minutes
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });

    this.getSigningKey = promisify(this.jwksClient.getSigningKey.bind(this.jwksClient));
  }

  private async verifyToken(token: string): Promise<JWTUser> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        async (header, callback) => {
          try {
            const key = await this.getSigningKey(header.kid);
            const signingKey = 'publicKey' in key ? key.publicKey : key.rsaPublicKey;
            callback(null, signingKey);
          } catch (error) {
            callback(error);
          }
        },
        {
          audience: [
            'featherweight-app',
            'featherweight-frontend',
            'account',
          ],
          issuer: `${process.env.KEYCLOAK_SERVER_URL || 'http://localhost:8080'}/realms/${process.env.KEYCLOAK_REALM || 'featherweight'}`,
          algorithms: ['RS256'],
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

  // Main authentication middleware
  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
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
        res.status(401).json({ 
          error: 'Token Expired', 
          message: 'JWT token has expired' 
        });
        return;
      }

      (req as AuthenticatedRequest).user = user;
      next();
    } catch (error) {
      console.error('JWT verification failed:', error);
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
          (req as AuthenticatedRequest).user = user;
        }
      }
      
      next();
    } catch (error) {
      // Continue without authentication
      next();
    }
  };

  // Role-based authorization middleware
  requireRole = (role: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as AuthenticatedRequest).user;
      
      if (!user) {
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
        res.status(403).json({ 
          error: 'Forbidden', 
          message: `Required role: ${role}` 
        });
        return;
      }

      next();
    };
  };

  // Project-level RBAC authorization
  requireProjectRole = (projectId: string, role: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as AuthenticatedRequest).user;
      
      if (!user) {
        res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
        return;
      }

      // Check if user has access to the project
      if (!user.projects?.includes(projectId)) {
        res.status(403).json({ 
          error: 'Forbidden', 
          message: `No access to project: ${projectId}` 
        });
        return;
      }

      // Check if user has the required role for the project
      const projectRole = `${projectId}:${role}`;
      if (!user.project_roles?.includes(projectRole)) {
        res.status(403).json({ 
          error: 'Forbidden', 
          message: `Required project role: ${role} for project: ${projectId}` 
        });
        return;
      }

      next();
    };
  };

  // Check if user has any role in a project
  requireProjectAccess = (projectId: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as AuthenticatedRequest).user;
      
      if (!user) {
        res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
        return;
      }

      if (!user.projects?.includes(projectId)) {
        res.status(403).json({ 
          error: 'Forbidden', 
          message: `No access to project: ${projectId}` 
        });
        return;
      }

      next();
    };
  };

  // Admin-only access
  requireAdmin = this.requireRole('admin');

  // Premium user access
  requirePremium = this.requireRole('premium');

  // Helper method to get user project roles
  getUserProjectRoles = (user: JWTUser, projectId: string): string[] => {
    if (!user.project_roles) return [];
    
    return user.project_roles
      .filter(role => role.startsWith(`${projectId}:`))
      .map(role => role.split(':')[1]);
  };

  // Helper method to check if user has specific project role
  hasProjectRole = (user: JWTUser, projectId: string, role: string): boolean => {
    const projectRole = `${projectId}:${role}`;
    return user.project_roles?.includes(projectRole) || false;
  };

  // Helper method to get all user projects
  getUserProjects = (user: JWTUser): string[] => {
    return user.projects || [];
  };
}

// Export singleton instance
export const authMiddleware = new AuthMiddleware();

// Export individual middleware functions for convenience
export const authenticate = authMiddleware.authenticate;
export const optionalAuth = authMiddleware.optionalAuth;
export const requireRole = authMiddleware.requireRole;
export const requireProjectRole = authMiddleware.requireProjectRole;
export const requireProjectAccess = authMiddleware.requireProjectAccess;
export const requireAdmin = authMiddleware.requireAdmin;
export const requirePremium = authMiddleware.requirePremium;

// Export utility functions
export const getUserProjectRoles = authMiddleware.getUserProjectRoles;
export const hasProjectRole = authMiddleware.hasProjectRole;
export const getUserProjects = authMiddleware.getUserProjects;
