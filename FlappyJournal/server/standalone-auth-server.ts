import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { hardenedAuthService } from './auth-service-hardened';

const app = express();

// Security middleware
app.use(helmet());
app.use(cookieParser());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(this, [bodyJson, ...args]);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    let line = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
    if (capturedJsonResponse && req.method !== 'GET') {
      const response = JSON.stringify(capturedJsonResponse);
      line += ` :: ${response.length > 100 ? response.slice(0, 100) + '...' : response}`;
    }
    console.log(line);
  });

  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'featherweight-auth-service',
    version: '1.0.0',
    uptime: process.uptime(),
  });
});

// Setup auth routes
hardenedAuthService.setupRoutes(app);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

const PORT = process.env.AUTH_PORT || 4001;

const server = app.listen(PORT, () => {
  console.log(`🔐 Featherweight Auth Service running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://127.0.0.1:${PORT}/auth/docs`);
  console.log(`💚 Health check at http://127.0.0.1:${PORT}/health`);
  console.log(`🔑 Demo credentials: demo@featherweight.world / demo123`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Auth service shut down');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Auth service shut down');
    process.exit(0);
  });
});

export default app;
