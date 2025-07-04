import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  PORT: process.env.GATEWAY_PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  KEYCLOAK_SERVER_URL: process.env.KEYCLOAK_SERVER_URL || 'http://localhost:8080',
  KEYCLOAK_REALM: process.env.KEYCLOAK_REALM || 'featherweight',
  
  // Downstream Services
  SERVICES: {
    AUTH: process.env.AUTH_SERVICE_URL || 'http://localhost:8081',
    JOURNAL: process.env.JOURNAL_SERVICE_URL || 'http://localhost:5000',
    WEBSOCKET: process.env.WEBSOCKET_SERVICE_URL || 'http://localhost:5001',
    CHAT_ORCHESTRATOR: process.env.CHAT_ORCHESTRATOR_URL || 'http://localhost:5002',
    FRONTEND: process.env.FRONTEND_SERVICE_URL || 'http://localhost:3001',
  },
  
  // Rate Limiting (100 req/5 min/IP as specified)
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '300000'), // 5 minutes
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    SKIP_SUCCESSFUL_REQUESTS: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true',
  },
  
  // Redis Configuration (for distributed rate limiting)
  REDIS: {
    HOST: process.env.REDIS_HOST || 'localhost',
    PORT: parseInt(process.env.REDIS_PORT || '6379'),
    PASSWORD: process.env.REDIS_PASSWORD,
    DB: parseInt(process.env.REDIS_DB || '0'),
  },
  
  // CORS Configuration
  CORS: {
    ORIGIN: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000', 
      'http://localhost:3001',
      'https://app.featherweight.world'
    ],
    CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',
  },
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Security
  TRUST_PROXY: process.env.TRUST_PROXY === 'true',
  
  // Health Check
  HEALTH_CHECK_INTERVAL: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'), // 30 seconds
};
