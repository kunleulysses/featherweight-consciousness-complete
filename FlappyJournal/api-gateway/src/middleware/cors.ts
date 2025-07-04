import cors from 'cors';
import { config } from '../config';
import logger from '../utils/logger';

// CORS configuration with specific origin for featherweight.world
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, Postman)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (config.CORS.ORIGIN.includes(origin)) {
      return callback(null, true);
    }

    // Specifically allow https://app.featherweight.world
    if (origin === 'https://app.featherweight.world') {
      return callback(null, true);
    }

    // For development, allow localhost with any port
    if (config.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }

    logger.warn('CORS blocked request from unauthorized origin', { origin });
    callback(new Error('Not allowed by CORS'), false);
  },
  credentials: config.CORS.CREDENTIALS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-User-ID',
    'X-Project-ID',
    'X-Request-ID',
    'X-Correlation-ID',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  maxAge: 86400, // 24 hours
};

// Pre-flight OPTIONS handler for complex requests
export const corsMiddleware = cors(corsOptions);

// Manual CORS setup for WebSocket upgrades and special cases
export const setupCORS = (app: any) => {
  // Handle pre-flight requests
  app.options('*', corsMiddleware);
  
  // Apply CORS to all requests
  app.use(corsMiddleware);
};

export default corsMiddleware;
