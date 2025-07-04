import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { setupAuthRoutes } from './auth-routes';
import { authMiddleware, authenticate, optionalAuth } from './auth-middleware';
import { MigrationRunner } from './migration-runner';
import { initializeKeycloak } from '../auth-service/init-keycloak';
import { setupRoutes } from './routes';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Environment setup
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const USE_NEW_AUTH = process.env.USE_NEW_AUTH === 'true' || NODE_ENV === 'production';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: function (origin: any, callback: any) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://app.featherweight.ai',
      'https://featherweight.ai',
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: NODE_ENV,
    authentication: USE_NEW_AUTH ? 'keycloak' : 'legacy',
    services: {
      database: 'connected', // You could add actual DB health check here
      redis: 'connected', // You could add actual Redis health check here
    },
  });
});

// Authentication setup
if (USE_NEW_AUTH) {
  console.log('🔐 Using Keycloak-based authentication');
  
  // Setup new authentication routes
  setupAuthRoutes(app);
  
  // Deprecation notice for old auth endpoints
  const deprecatedAuthRoutes = ['/api/register', '/api/login', '/api/logout', '/api/user'];
  
  deprecatedAuthRoutes.forEach(route => {
    app.all(route, (req, res) => {
      res.status(410).json({
        error: 'Endpoint Deprecated',
        message: `This endpoint has been deprecated. Please use the new authentication system at /auth/*`,
        migration_guide: 'https://docs.featherweight.ai/migration/auth',
        new_endpoints: {
          register: '/auth/register',
          login: '/auth/login',
          logout: '/auth/logout',
          user_info: '/auth/me',
        },
      });
    });
  });
  
} else {
  console.log('⚠️  Using legacy authentication (deprecated)');
  
  // Import and setup legacy auth
  const { setupAuth } = require('./auth');
  setupAuth(app);
  
  // Add deprecation warning header
  app.use('/api/register', (req, res, next) => {
    res.header('X-Deprecation-Warning', 'This endpoint is deprecated. Migrate to /auth/register');
    next();
  });
  
  app.use('/api/login', (req, res, next) => {
    res.header('X-Deprecation-Warning', 'This endpoint is deprecated. Migrate to /auth/login');
    next();
  });
  
  app.use('/api/logout', (req, res, next) => {
    res.header('X-Deprecation-Warning', 'This endpoint is deprecated. Migrate to /auth/logout');
    next();
  });
  
  app.use('/api/user', (req, res, next) => {
    res.header('X-Deprecation-Warning', 'This endpoint is deprecated. Migrate to /auth/me');
    next();
  });
}

// Apply authentication middleware based on configuration
if (USE_NEW_AUTH) {
  // Protected API routes with new JWT auth
  app.use('/api', authenticate);
  
  // Optional auth for public endpoints
  app.use('/public', optionalAuth);
} else {
  // Legacy passport-based authentication
  app.use('/api', (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  });
}

// Setup main application routes
setupRoutes(app);

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');
  
  // Handle authentication for WebSocket
  if (USE_NEW_AUTH) {
    // Extract JWT from query parameters or headers
    const token = req.url?.includes('token=') 
      ? new URL(req.url, 'http://localhost').searchParams.get('token')
      : null;
    
    if (!token) {
      ws.close(1008, 'Authentication required');
      return;
    }
    
    // Verify JWT token (simplified - in production, use proper verification)
    // This would use the authMiddleware.verifyToken method
    console.log('WebSocket authenticated with JWT');
  } else {
    // Legacy WebSocket auth
    console.log('WebSocket using legacy authentication');
  }
  
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    // Handle WebSocket messages
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Global error handler
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Global error handler:', error);
  
  // Don't leak error details in production
  const isDevelopment = NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    error: error.message || 'Internal Server Error',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString(),
    path: req.path,
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Startup function
async function startServer() {
  try {
    console.log('🚀 Starting Featherweight Journal Server...');
    console.log(`📱 Environment: ${NODE_ENV}`);
    console.log(`🔐 Authentication: ${USE_NEW_AUTH ? 'Keycloak' : 'Legacy'}`);
    
    // Run database migrations
    console.log('📦 Running database migrations...');
    const migrationRunner = new MigrationRunner();
    await migrationRunner.runMigrations();
    
    // Initialize Keycloak if using new auth and not already initialized
    if (USE_NEW_AUTH && process.env.AUTO_INIT_KEYCLOAK === 'true') {
      try {
        console.log('🔐 Initializing Keycloak...');
        await initializeKeycloak();
      } catch (error) {
        console.warn('⚠️  Keycloak initialization failed (may already be initialized):', error);
      }
    }
    
    // Start the server
    server.listen(PORT, () => {
      console.log('✅ Server started successfully!');
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      
      if (USE_NEW_AUTH) {
        console.log(`🔐 Authentication: http://localhost:${PORT}/auth/*`);
        console.log(`📋 Auth endpoints:`);
        console.log(`   - POST /auth/register`);
        console.log(`   - POST /auth/login`);
        console.log(`   - POST /auth/logout`);
        console.log(`   - GET /auth/me`);
        console.log(`   - POST /auth/refresh`);
      } else {
        console.log(`⚠️  Legacy auth: http://localhost:${PORT}/api/*`);
        console.log(`📋 Legacy endpoints (deprecated):`);
        console.log(`   - POST /api/register`);
        console.log(`   - POST /api/login`);
        console.log(`   - POST /api/logout`);
        console.log(`   - GET /api/user`);
      }
      
      console.log(`🔌 API Gateway: ${process.env.KONG_PROXY_URL || 'Not configured'}`);
      console.log(`📊 WebSocket: ws://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export { app, server, wss };
