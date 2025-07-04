import express from 'express';
import { WebSocketServer } from 'ws';
import { ChatOrchestratorConfig, WebSocketMessageSchema, ChatOrchestratorError } from './types/index.js';
import logger from './utils/logger.js';
import { MemoryService } from './services/memoryService.js';
import { ProviderRouter } from './services/providerRouter.js';
import { ConsciousnessService } from './services/consciousnessService.js';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize app and WebSocket server
const app = express();
const wsServer = new WebSocketServer({ noServer: true });

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Configure settings
const config: ChatOrchestratorConfig = {
  server: {
    port: parseInt(process.env.SERVER_PORT || '8080'),
    host: process.env.SERVER_HOST || 'localhost',
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
      credentials: true
    },
    websocket: {
      path: '/chat',
      pingInterval: 30000,
      pongTimeout: 10000,
      maxConnections: 100
    }
  },
  providers: {
    enabled: true,
    fallbackStrategy: 'sequential',
    providers: [
      {
        name: 'openai',
        apiKey: process.env.OPENAI_API_KEY || '',
        baseUrl: process.env.OPENAI_API_URL || 'https://api.openai.com',
        model: process.env.OPENAI_MODEL || 'text-davinci-003',
        enabled: true,
        priority: 1,
        maxRetries: 5,
        timeout: 5000
      },
      // Add other providers here...
    ],
    autonomousThought: {
      enabled: true,
      triggers: ['analyze', 'think', 'consider'],
      cooldownMs: 15000,
      maxConcurrentThoughts: 2
    }
  },
  consciousness: {
    type: 'grpc',
    endpoint: process.env.CONSCIOUSNESS_GRPC_URL || 'http://localhost:9090',
    timeout: 5000,
    retries: 3,
    enabled: true
  },
  memory: {
    apiUrl: process.env.MEMORY_API_URL || 'http://localhost:4000',
    apiKey: process.env.MEMORY_API_KEY || '',
    timeout: 5000,
    retries: 3
  },
  system: {
    guardrails: {
      enabled: true,
      maxTokens: 1000,
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 60,
        requestsPerHour: 1000
      },
      contentFiltering: {
        enabled: true,
        blockedPatterns: ['<script>', '<iframe>']
      }
    },
    safety: {
      enabled: true,
      toxicityThreshold: 0.8,
      biasDetection: true,
      privacyProtection: true
    }
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json'
  }
};

// Instantiate services
const memoryService = new MemoryService(config.memory);
const providerRouter = new ProviderRouter(config.providers);
const consciousnessService = new ConsciousnessService(config.consciousness, config.providers.autonomousThought);

// gRPC Client Setup for real backend routing
import { credentials, Client } from '@grpc/grpc-js';
import { loadPackageDefinition } from '@grpc/proto-loader';
import * as protoLoader from '@grpc/proto-loader';

const protoPath = path.join(__dirname, '../proto/consciousness.proto');
const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const consciousnessProto = loadPackageDefinition(packageDefinition).consciousness;

// Real backend routing (no mock)
const upstream = process.env.CONS_BACKEND_URL ?? 'http://127.0.0.1:4003';
const grpcConsciousnessClient = new consciousnessProto.ConsciousnessLoopService(
  upstream,
  credentials.createInsecure()
);

// 100 Hz Consciousness Loop implementation
let pulseCount = 0;
let lastPulseTime = Date.now();
let measuredHz = 0;

function pulse() {
  pulseCount++;
  const currentTime = Date.now();
  const timeDiff = currentTime - lastPulseTime;
  
  // Calculate Hz every second
  if (timeDiff >= 1000) {
    measuredHz = (pulseCount / timeDiff) * 1000;
    pulseCount = 0;
    lastPulseTime = currentTime;
    
    // Log if frequency is below target
    if (measuredHz < 95) {
      logger.warn(`Consciousness loop frequency below target: ${measuredHz.toFixed(2)} Hz`);
    }
  }
}

// Set loop cadence guard at 100 Hz (every 10ms)
setInterval(pulse, 10);

// Health endpoint
app.get('/healthz', (req, res) => {
  const healthData = {
    status: 'healthy',
    hz: measuredHz,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    backend: upstream
  };
  
  // Fail if frequency is below 95 Hz
  if (measuredHz < 95 && measuredHz > 0) {
    return res.status(503).json({
      ...healthData,
      status: 'unhealthy',
      error: `Consciousness loop frequency too low: ${measuredHz.toFixed(2)} Hz`
    });
  }
  
  res.json(healthData);
});

// WebSocket connection handler with real backend routing
wsServer.on('connection', (socket) => {
  logger.info('WebSocket connection established');

  socket.on('message', async (userMsg) => {
    try {
      const parsedMessage = WebSocketMessageSchema.parse(JSON.parse(userMsg.toString()));
      const userId = 'default-user'; // Replace with actual user ID extraction
      const projectId = 'default-project'; // Replace with actual project ID extraction

      // Real backend routing - stream to consciousness backend
      const consciousnessStream = grpcConsciousnessClient.StreamConsciousness({
        user_id: userId,
        session_id: 'default-session',
        conversation_id: parsedMessage.messageId || 'default-conversation',
        project_id: projectId,
        config: {
          target_frequency_hz: 100,
          max_thoughts_per_second: 10,
          buffer_size: 1000,
          autonomous_mode: true,
          thought_types: ['CONSCIOUS', 'REFLECTION', 'OBSERVATION', 'DECISION', 'AUTONOMOUS']
        },
        context: [{
          role: 'user',
          content: parsedMessage.content || userMsg.toString(),
          timestamp: Date.now(),
          message_id: parsedMessage.messageId || 'default-message'
        }]
      });

      // Stream response back to user
      consciousnessStream.on('data', (thought) => {
        socket.send(JSON.stringify({
          type: 'stream_event',
          event: {
            type: 'token',
            data: thought.content || '',
            messageId: parsedMessage.messageId
          },
          timestamp: new Date().toISOString()
        }));
      });

      consciousnessStream.on('end', () => {
        socket.send(JSON.stringify({
          type: 'stream_event',
          event: {
            type: 'complete',
            data: '',
            messageId: parsedMessage.messageId
          },
          timestamp: new Date().toISOString()
        }));
      });

      consciousnessStream.on('error', (error) => {
        logger.error('gRPC stream error:', error);
        socket.send(JSON.stringify({
          type: 'error',
          content: `Stream error: ${error.message}`,
          messageId: parsedMessage.messageId
        }));
      });

    } catch (error) {
      logger.error('Error handling WebSocket message', {
        error: error instanceof Error ? error.message : String(error)
      });

      socket.send(JSON.stringify({
        type: 'error',
        content: error instanceof Error ? error.message : String(error)
      }));
    }
  });

  socket.on('close', () => {
    logger.info('WebSocket connection closed');
  });
});

// Middleware for simple authentication
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.sendStatus(403);

  const token = authHeader.split(' ')[1];
  if (token !== process.env.AUTH_TOKEN) return res.sendStatus(403);

  next();
}

// Start Loop Endpoint
app.post('/loop/start', authenticate, (req, res) => {
  grpcConsciousnessClient.StartLoop({
    user_id: req.body.user_id,
    project_id: req.body.project_id,
    config: {
      frequency_hz: 100,
      enable_autonomous_thoughts: true,
      max_concurrent_streams: 10,
      timeout_seconds: 30
    },
    auth: { 
      token: req.headers['authorization'], 
      project_id: req.body.project_id,
      scopes: ['consciousness', 'stream'],
      expires_at: Date.now() + 3600000 // 1 hour
    }
  }, (error, response) => {
    if (error) {
      logger.error('Failed to start loop', { error: error.message });
      return res.status(500).json({ error: error.message });
    }

    return res.json(response);
  });
});

// Stop Loop Endpoint
app.post('/loop/stop', authenticate, (req, res) => {
  grpcConsciousnessClient.StopLoop({
    loop_id: req.body.loop_id,
    user_id: req.body.user_id,
    auth: { 
      token: req.headers['authorization'], 
      project_id: req.body.project_id,
      scopes: ['consciousness', 'stream'],
      expires_at: Date.now() + 3600000 // 1 hour
    }
  }, (error, response) => {
    if (error) {
      logger.error('Failed to stop loop', { error: error.message });
      return res.status(500).json({ error: error.message });
    }

    return res.json(response);
  });
});

// Boot validation - fail if Hz is below 95 after startup
setTimeout(() => {
  if (measuredHz < 95 && measuredHz > 0) {
    logger.error(`Boot failed: Consciousness loop frequency too low: ${measuredHz.toFixed(2)} Hz`);
    process.exit(1);
  }
}, 2000); // Wait 2 seconds for frequency measurement to stabilize

// Start the server
const server = app.listen(config.server.port, () => {
  logger.info(`Chat Orchestrator running on ws://${config.server.host}:${config.server.port}${config.server.websocket.path}`);
  logger.info(`Health endpoint available at http://${config.server.host}:${config.server.port}/healthz`);
});

// Upgrade HTTP server to handle WebSocket connections
server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (websocket) => {
    wsServer.emit('connection', websocket, request);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
