import express from 'express';
import compression from 'compression';
import { createServer } from 'http';
import { config } from './config';
import logger from './utils/logger';

// Middleware imports
import { setupCORS } from './middleware/cors';
import { securityHeaders, requestSizeLimiter, sanitizeRequest, requestTimeout } from './middleware/security';
import { requestLogger, errorLogger, requestCorrelation } from './middleware/requestLogger';
import { 
  generalRateLimit, 
  authRateLimit, 
  strictRateLimit, 
  dynamicRateLimit,
  slowDownMiddleware 
} from './middleware/rateLimiter';
import { 
  authenticate, 
  expressJWTAuth,
  optionalAuth, 
  requireRole, 
  requireProjectAccess 
} from './middleware/auth';
import { 
  dynamicProxyRouter,
  authServiceProxy,
  journalServiceProxy,
  websocketServiceProxy,
  chatWebSocketProxy,
  healthCheckProxy,
  serviceHealthChecker
} from './middleware/proxy';

// OpenAPI Documentation
import { setupSwagger } from './docs/swagger';

const app = express();

// Create HTTP server for WebSocket support
const server = createServer(app);

// Trust proxy for accurate IP addresses
if (config.TRUST_PROXY) {
  app.set('trust proxy', true);
}

// Basic middleware setup
app.use(compression()); // Enable gzip compression
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Security middleware
app.use(securityHeaders);
app.use(requestSizeLimiter);
app.use(sanitizeRequest);
app.use(requestTimeout(30000)); // 30 second timeout

// CORS setup - includes https://app.featherweight.world
setupCORS(app);

// Request correlation and logging
app.use(requestCorrelation);
app.use(requestLogger);

// Global rate limiting (100 req/5 min/IP) and slow down
app.use(generalRateLimit);
app.use(slowDownMiddleware);

// Setup OpenAPI documentation at /api/docs
setupSwagger(app);

// Gateway health endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      auth: config.SERVICES.AUTH,
      journal: config.SERVICES.JOURNAL,
      websocket: config.SERVICES.WEBSOCKET,
      chatOrchestrator: config.SERVICES.CHAT_ORCHESTRATOR,
      frontend: config.SERVICES.FRONTEND,
    },
  });
});

app.get('/ready', async (req, res) => {
  try {
    // Check downstream service health
    const services = {
      auth: await serviceHealthChecker.checkServiceHealth('auth', config.SERVICES.AUTH),
      journal: await serviceHealthChecker.checkServiceHealth('journal', config.SERVICES.JOURNAL),
      websocket: await serviceHealthChecker.checkServiceHealth('websocket', config.SERVICES.WEBSOCKET),
      chatOrchestrator: await serviceHealthChecker.checkServiceHealth('chat-orchestrator', config.SERVICES.CHAT_ORCHESTRATOR),
    };
    
    const allHealthy = Object.values(services).every(healthy => healthy);
    
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ready' : 'not ready',
      timestamp: new Date().toISOString(),
      services,
    });
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// API Gateway routes with express-jwt middleware

// Authentication endpoints - strict rate limiting, no auth required
app.use('/api/auth/login', authRateLimit);
app.use('/api/auth/register', authRateLimit);
app.use('/api/auth/refresh', authRateLimit);
app.use('/api/auth/*', optionalAuth); // Optional auth for auth service
app.use('/api/auth/*', authServiceProxy);

// Journal API - requires express-jwt authentication and dynamic rate limiting
app.use('/api/journal/public/*', optionalAuth, dynamicRateLimit); // Public endpoints
app.use('/api/journal/admin/*', expressJWTAuth(), requireRole('admin'), strictRateLimit); // Admin endpoints
app.use('/api/journal/projects/:projectId/*', expressJWTAuth(), requireProjectAccess(), dynamicRateLimit); // Project-specific endpoints
app.use('/api/journal/*', expressJWTAuth(), dynamicRateLimit); // All other journal endpoints require JWT
app.use('/api/journal/*', journalServiceProxy);

// WebSocket API - requires express-jwt authentication
app.use('/api/ws/*', expressJWTAuth());
app.use('/api/ws/*', websocketServiceProxy);

// Chat WebSocket upgrade - requires authentication, routes to Chat-Orchestrator
app.use('/ws/chat', expressJWTAuth());

// Health check proxying
app.use('/api/health', healthCheckProxy);

// Default routing to services
app.use('*', dynamicProxyRouter);

// Handle WebSocket upgrades
server.on('upgrade', (request, socket, head) => {
  const url = request.url;
  
  logger.info('WebSocket upgrade request', {
    url,
    origin: request.headers.origin,
    userAgent: request.headers['user-agent'],
  });

  // Route WebSocket upgrades to Chat-Orchestrator for /ws/chat
  if (url && url.startsWith('/ws/chat')) {
    chatWebSocketProxy.upgrade(request, socket, head);
  } else if (url && url.startsWith('/api/ws')) {
    websocketServiceProxy.upgrade(request, socket, head);
  } else {
    socket.destroy();
  }
});

// Error handling middleware
app.use(errorLogger);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error in gateway', {
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
    },
    user: {
      id: req.headers['x-user-id'],
      email: req.headers['x-user-email'],
    },
  });

  if (!res.headersSent) {
    res.status(err.status || 500).json({
      error: 'Internal Server Error',
      message: config.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'],
    });
  }
});

// Handle 404s
app.use((req: express.Request, res: express.Response) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'],
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown`);
  
  server.close((err) => {
    if (err) {
      logger.error('Error during server shutdown', { error: err.message });
      process.exit(1);
    }
    
    logger.info('Server closed successfully');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Start server on port 4000
server.listen(config.PORT, () => {
  logger.info('API Gateway started', {
    port: config.PORT,
    nodeEnv: config.NODE_ENV,
    services: config.SERVICES,
    cors: config.CORS,
    rateLimit: config.RATE_LIMIT,
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
  process.exit(1);
});

export default app;
