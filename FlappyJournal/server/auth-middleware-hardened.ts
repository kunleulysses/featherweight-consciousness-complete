import { Request, Response, NextFunction } from 'express';
import { hardenedAuthService } from './auth-service-hardened';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    username: string;
    roles: string[];
  };
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Access token required',
      });
    }

    const payload = hardenedAuthService.verifyAccessToken(token);
    if (!payload) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }

    // Attach user info to request
    (req as AuthenticatedRequest).user = {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      roles: payload.roles,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication failed',
    });
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.cookies?.access_token;

    if (token) {
      const payload = hardenedAuthService.verifyAccessToken(token);
      if (payload) {
        (req as AuthenticatedRequest).user = {
          id: payload.sub,
          email: payload.email,
          username: payload.username,
          roles: payload.roles,
        };
      }
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next(); // Continue without authentication
  }
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (!user.roles.includes(role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Role '${role}' required`,
      });
    }

    next();
  };
};

export const requireAdmin = [authenticate, requireRole('admin')];
