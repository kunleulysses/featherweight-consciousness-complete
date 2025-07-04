import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { config } from '../config';
import logger from '../utils/logger';

// Enhanced security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "wss:", "ws:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for WebSocket compatibility
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Request size limits
export const requestSizeLimiter = (req: Request, res: Response, next: NextFunction) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const contentLength = parseInt(req.headers['content-length'] || '0');
  
  if (contentLength > maxSize) {
    logger.warn('Request rejected due to size limit', {
      contentLength,
      maxSize,
      path: req.path,
      userId: req.headers['x-user-id'],
    });
    
    return res.status(413).json({
      error: 'Payload Too Large',
      message: 'Request payload exceeds maximum allowed size',
      maxSize: `${maxSize / 1024 / 1024}MB`,
    });
  }
  
  next();
};

// Request validation middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Request validation failed', {
      errors: errors.array(),
      path: req.path,
      method: req.method,
      userId: req.headers['x-user-id'],
    });
    
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Request validation failed',
      details: errors.array(),
    });
  }
  
  next();
};

// Common validation rules
export const validations = {
  // Project ID validation
  projectId: param('projectId')
    .isUUID()
    .withMessage('Project ID must be a valid UUID'),
  
  // User ID validation
  userId: param('userId')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  
  // Pagination validation
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  
  // Search validation
  search: query('q')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be between 1 and 200 characters')
    .escape(), // Escape HTML entities
  
  // Email validation
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  
  // Password validation (for auth endpoints)
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
};

// Anti-CSRF token validation for state-changing operations
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Skip CSRF for API requests with JWT (stateless)
  if (req.headers.authorization) {
    return next();
  }
  
  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionToken = req.session?.csrfToken;
  
  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    logger.warn('CSRF token validation failed', {
      path: req.path,
      method: req.method,
      hasToken: !!csrfToken,
      hasSession: !!sessionToken,
      userId: req.headers['x-user-id'],
    });
    
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid CSRF token',
    });
  }
  
  next();
};

// IP whitelist middleware (for admin endpoints)
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!allowedIPs.includes(clientIP)) {
      logger.warn('IP whitelist violation', {
        clientIP,
        allowedIPs,
        path: req.path,
        userAgent: req.get('User-Agent'),
      });
      
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied from this IP address',
      });
    }
    
    next();
  };
};

// Request sanitization middleware
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Remove potential XSS vectors from query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string)
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    }
  }
  
  // Log suspicious patterns
  const suspicious = [
    'script',
    'javascript:',
    'onload=',
    'onerror=',
    'eval(',
    'alert(',
    'document.cookie',
    'window.location',
  ];
  
  const requestString = JSON.stringify(req.body) + JSON.stringify(req.query);
  const foundSuspicious = suspicious.filter(pattern => 
    requestString.toLowerCase().includes(pattern)
  );
  
  if (foundSuspicious.length > 0) {
    logger.warn('Suspicious request detected', {
      patterns: foundSuspicious,
      path: req.path,
      method: req.method,
      userId: req.headers['x-user-id'],
      userAgent: req.get('User-Agent'),
      body: req.body,
      query: req.query,
    });
  }
  
  next();
};

// Request timeout middleware
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn('Request timeout', {
          path: req.path,
          method: req.method,
          timeout: timeoutMs,
          userId: req.headers['x-user-id'],
        });
        
        res.status(408).json({
          error: 'Request Timeout',
          message: 'Request took too long to process',
          timeout: `${timeoutMs}ms`,
        });
      }
    }, timeoutMs);
    
    // Clear timeout when response is finished
    res.on('finish', () => {
      clearTimeout(timeout);
    });
    
    res.on('close', () => {
      clearTimeout(timeout);
    });
    
    next();
  };
};

export default {
  securityHeaders,
  requestSizeLimiter,
  validateRequest,
  validations,
  csrfProtection,
  ipWhitelist,
  sanitizeRequest,
  requestTimeout,
};
