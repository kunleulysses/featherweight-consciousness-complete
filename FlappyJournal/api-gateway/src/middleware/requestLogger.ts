import morgan from 'morgan';
import { Request, Response } from 'express';
import logger from '../utils/logger';
import { config } from '../config';

// Custom token for user ID
morgan.token('user-id', (req: Request) => {
  return req.headers['x-user-id'] as string || 'anonymous';
});

// Custom token for user email
morgan.token('user-email', (req: Request) => {
  return req.headers['x-user-email'] as string || 'anonymous';
});

// Custom token for project ID
morgan.token('project-id', (req: Request) => {
  return req.headers['x-project-id'] as string || 'none';
});

// Custom token for request ID (for tracing)
morgan.token('request-id', (req: Request) => {
  return req.headers['x-request-id'] as string || 'none';
});

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req: Request, res: Response) => {
  const responseTime = morgan['response-time'](req, res);
  return responseTime ? `${responseTime}ms` : 'unknown';
});

// Development format - detailed logging
const developmentFormat = morgan(
  ':method :url :status :res[content-length] - :response-time-ms :user-id :user-email :project-id',
  {
    stream: {
      write: (message: string) => {
        logger.info(message.trim(), { component: 'http-request' });
      },
    },
  }
);

// Production format - structured JSON logging
const productionFormat = morgan(
  (tokens, req: Request, res: Response) => {
    const logData = {
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: parseInt(tokens.status(req, res) || '0'),
      contentLength: tokens.res(req, res, 'content-length'),
      responseTime: parseFloat(tokens['response-time'](req, res) || '0'),
      userAgent: tokens['user-agent'](req, res),
      remoteAddr: tokens['remote-addr'](req, res),
      userId: tokens['user-id'](req, res),
      userEmail: tokens['user-email'](req, res),
      projectId: tokens['project-id'](req, res),
      requestId: tokens['request-id'](req, res),
      timestamp: new Date().toISOString(),
      referer: tokens.referrer(req, res),
    };

    // Log different levels based on status code
    if (res.statusCode >= 500) {
      logger.error('HTTP Request - Server Error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Request - Client Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }

    return null; // Return null to prevent default morgan output
  },
  {
    skip: (req: Request, res: Response) => {
      // Skip logging for health checks in production
      return config.NODE_ENV === 'production' && 
             (req.path === '/health' || req.path === '/ready');
    },
  }
);

// Combined format with custom fields
const combinedFormat = morgan(
  ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-ms',
  {
    stream: {
      write: (message: string) => {
        logger.info(message.trim(), { component: 'access-log' });
      },
    },
  }
);

// Error logging middleware
export const errorLogger = (err: any, req: Request, res: Response, next: Function) => {
  logger.error('Request Error', {
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
    },
    user: {
      id: req.headers['x-user-id'],
      email: req.headers['x-user-email'],
    },
    timestamp: new Date().toISOString(),
  });
  
  next(err);
};

// Request correlation ID middleware
export const requestCorrelation = (req: Request, res: Response, next: Function) => {
  // Generate or extract request ID for tracing
  const requestId = req.headers['x-request-id'] as string || 
                   req.headers['x-correlation-id'] as string ||
                   `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);
  
  next();
};

// Export the appropriate format based on environment
export const requestLogger = config.NODE_ENV === 'production' 
  ? productionFormat 
  : developmentFormat;

// Export additional formats for specific use cases
export { combinedFormat, developmentFormat, productionFormat };
