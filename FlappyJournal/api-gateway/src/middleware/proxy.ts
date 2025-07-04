import { createProxyMiddleware, Options, RequestHandler } from 'http-proxy-middleware';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import logger from '../utils/logger';

// Route configuration for services
const serviceRoutes = {
  '/api/auth': config.SERVICES.AUTH,
  '/api/journal': config.SERVICES.JOURNAL,
  '/api/ws': config.SERVICES.WEBSOCKET,
  '/ws/chat': config.SERVICES.CHAT_ORCHESTRATOR, // Direct WebSocket upgrade for chat
  '/api/health': config.SERVICES.JOURNAL, // Health checks go to main service
  '/': config.SERVICES.FRONTEND, // Fallback to frontend for SPA routes
};

// Default proxy options
const defaultProxyOptions: Partial<Options> = {
  changeOrigin: true,
  timeout: 30000, // 30 second timeout
  proxyTimeout: 30000,
  logLevel: config.NODE_ENV === 'production' ? 'warn' : 'debug',
  
  // Handle proxy errors
  onError: (err: Error, req: Request, res: Response) => {
    logger.error('Proxy error', {
      error: err.message,
      target: (req as any).proxiedUrl,
      path: req.path,
      method: req.method,
      userId: req.headers['x-user-id'],
    });
    
    if (!res.headersSent) {
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'Service temporarily unavailable',
        timestamp: new Date().toISOString(),
      });
    }
  },
  
  // Log proxy requests
  onProxyReq: (proxyReq, req, res) => {
    const target = proxyReq.getHeader('host');
    
    logger.debug('Proxying request', {
      method: req.method,
      path: req.path,
      target,
      userId: req.headers['x-user-id'],
      userAgent: req.headers['user-agent'],
    });
    
    // Store target for error handling
    (req as any).proxiedUrl = target;
    
    // Set additional headers for downstream services
    proxyReq.setHeader('X-Forwarded-For', req.ip);
    proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
    proxyReq.setHeader('X-Forwarded-Host', req.get('host') || '');
    proxyReq.setHeader('X-Gateway-Version', '1.0.0');
    
    // Forward user context headers (already set by auth middleware)
    const userHeaders = [
      'x-user-id',
      'x-user-email', 
      'x-user-roles',
      'x-user-projects',
      'x-user-project-roles',
      'x-project-id',
      'x-request-id',
    ];
    
    userHeaders.forEach(header => {
      const value = req.headers[header];
      if (value) {
        proxyReq.setHeader(header, value as string);
      }
    });
  },
  
  // Log proxy responses
  onProxyRes: (proxyRes, req, res) => {
    const duration = Date.now() - (req as any).startTime;
    
    logger.debug('Proxy response received', {
      method: req.method,
      path: req.path,
      status: proxyRes.statusCode,
      duration,
      userId: req.headers['x-user-id'],
    });
    
    // Forward response headers from downstream services
    const headersToForward = [
      'x-request-id',
      'x-ratelimit-limit',
      'x-ratelimit-remaining',
      'x-ratelimit-reset',
    ];
    
    headersToForward.forEach(header => {
      const value = proxyRes.headers[header];
      if (value) {
        res.setHeader(header, value);
      }
    });
  },
};

// Create specific proxy middleware for each service
export const authServiceProxy = createProxyMiddleware({
  ...defaultProxyOptions,
  target: config.SERVICES.AUTH,
  pathRewrite: {
    '^/api/auth': '', // Remove /api/auth prefix
  },
});

export const journalServiceProxy = createProxyMiddleware({
  ...defaultProxyOptions,
  target: config.SERVICES.JOURNAL,
  pathRewrite: {
    '^/api/journal': '', // Remove /api/journal prefix
  },
});

export const websocketServiceProxy = createProxyMiddleware({
  ...defaultProxyOptions,
  target: config.SERVICES.WEBSOCKET,
  ws: true, // Enable WebSocket proxying
  pathRewrite: {
    '^/api/ws': '', // Remove /api/ws prefix
  },
});

// Chat WebSocket proxy - direct upgrade handling
export const chatWebSocketProxy = createProxyMiddleware({
  ...defaultProxyOptions,
  target: config.SERVICES.CHAT_ORCHESTRATOR,
  ws: true, // Enable WebSocket proxying
  pathRewrite: {
    '^/ws/chat': '/ws', // Rewrite to Chat-Orchestrator's WebSocket endpoint
  },
  onProxyReqWs: (proxyReq, req, socket) => {
    logger.info('WebSocket chat connection proxied', {
      path: req.url,
      userId: req.headers['x-user-id'],
      origin: req.headers.origin,
    });
  },
  onError: (err: Error, req: Request, res: Response) => {
    logger.error('Chat WebSocket proxy error', {
      error: err.message,
      path: req.path,
      userId: req.headers['x-user-id'],
    });
  },
});

export const frontendProxy = createProxyMiddleware({
  ...defaultProxyOptions,
  target: config.SERVICES.FRONTEND,
  // Don't rewrite paths for frontend - pass through as-is
});

// Health check proxy (goes to main service)
export const healthCheckProxy = createProxyMiddleware({
  ...defaultProxyOptions,
  target: config.SERVICES.JOURNAL,
  pathRewrite: {
    '^/api/health': '/health', // Map to service health endpoint
  },
});

// Dynamic router based on path
export const dynamicProxyRouter = (req: Request, res: Response, next: NextFunction) => {
  // Add start time for duration logging
  (req as any).startTime = Date.now();
  
  // Determine which service to proxy to based on path
  for (const [pathPrefix, target] of Object.entries(serviceRoutes)) {
    if (req.path.startsWith(pathPrefix)) {
      // Route to appropriate proxy middleware
      if (pathPrefix === '/api/auth') {
        return authServiceProxy(req, res, next);
      } else if (pathPrefix === '/api/journal') {
        return journalServiceProxy(req, res, next);
      } else if (pathPrefix === '/api/ws') {
        return websocketServiceProxy(req, res, next);
      } else if (pathPrefix === '/ws/chat') {
        return chatWebSocketProxy(req, res, next);
      } else if (pathPrefix === '/api/health') {
        return healthCheckProxy(req, res, next);
      }
    }
  }
  
  // Default to frontend for SPA routing
  return frontendProxy(req, res, next);
};

// Circuit breaker pattern for service health
class ServiceHealthChecker {
  private serviceHealth: Map<string, boolean> = new Map();
  private lastChecked: Map<string, number> = new Map();
  private checkInterval = 30000; // 30 seconds

  async checkServiceHealth(serviceName: string, serviceUrl: string): Promise<boolean> {
    const now = Date.now();
    const lastCheck = this.lastChecked.get(serviceName) || 0;
    
    // Return cached result if checked recently
    if (now - lastCheck < this.checkInterval) {
      return this.serviceHealth.get(serviceName) || false;
    }
    
    try {
      const response = await fetch(`${serviceUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      
      const isHealthy = response.ok;
      this.serviceHealth.set(serviceName, isHealthy);
      this.lastChecked.set(serviceName, now);
      
      if (!isHealthy) {
        logger.warn(`Service ${serviceName} health check failed`, {
          serviceName,
          serviceUrl,
          status: response.status,
        });
      }
      
      return isHealthy;
    } catch (error) {
      logger.error(`Service ${serviceName} health check error`, {
        serviceName,
        serviceUrl,
        error: error.message,
      });
      
      this.serviceHealth.set(serviceName, false);
      this.lastChecked.set(serviceName, now);
      return false;
    }
  }
  
  isServiceHealthy(serviceName: string): boolean {
    return this.serviceHealth.get(serviceName) || false;
  }
}

export const serviceHealthChecker = new ServiceHealthChecker();

// Middleware to check service health before proxying
export const healthCheckMiddleware = (serviceName: string, serviceUrl: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const isHealthy = await serviceHealthChecker.checkServiceHealth(serviceName, serviceUrl);
    
    if (!isHealthy) {
      logger.warn(`Request blocked due to unhealthy service: ${serviceName}`, {
        path: req.path,
        method: req.method,
        userId: req.headers['x-user-id'],
      });
      
      return res.status(503).json({
        error: 'Service Unavailable',
        message: `${serviceName} service is currently unavailable`,
        timestamp: new Date().toISOString(),
      });
    }
    
    next();
  };
};

export default dynamicProxyRouter;
