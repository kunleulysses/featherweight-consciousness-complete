import { Server, ServerCredentials } from '@grpc/grpc-js';
import { loadPackageDefinition } from '@grpc/proto-loader';
import * as protoLoader from '@grpc/proto-loader';
import { ConsciousnessLoopServiceHandlers } from '../types/grpc_types'; // Assuming types are generated
import { OpenAIStreamingConsciousnessLoop } from '../../../server/openai-streaming-consciousness-loop';
import logger from '../utils/logger';

// Load gRPC package definition
const packageDefinition = protoLoader.loadSync(
  'proto/consciousness.proto',
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }
);

const consciousnessProto = loadPackageDefinition(packageDefinition).consciousness;
let streamingLoopInstance: OpenAIStreamingConsciousnessLoop | null = null;

// Implement gRPC handlers
const handlers: ConsciousnessLoopServiceHandlers = {
  StreamConsciousness: (call, callback) => {
    if (!streamingLoopInstance) {
      callback({ code: grpc.status.NOT_FOUND, message: 'Streaming loop not found' }, null);
      return;
    }

    // Example backpressure handling (simple)
    let backPressureLevel = 0;

    call.on('data', (request) => {
      // Stream consciousness thoughts
      const thoughtsStream = streamingLoopInstance.streamThoughts(request);

      thoughtsStream.on('data', (thought) => {
        if (backPressureLevel >= 10) {
          thoughtsStream.pause(); // simple backpressure control
          setTimeout(() => thoughtsStream.resume(), Math.pow(2, backPressureLevel) * 100);
        }

        call.write(thought);
      });
    });

    call.on('end', () => {
      call.end();
    });
  },

  StartLoop: (call, callback) => {
    if (!streamingLoopInstance) {
      streamingLoopInstance = new OpenAIStreamingConsciousnessLoop();
    }

    streamingLoopInstance.startConsciousnessLoop()
      .then(() => {
        callback(null, { success: true, message: 'Loop started successfully', loop_id: call.request.loop_id });
      })
      .catch((error) => {
        callback({ code: grpc.status.ABORTED, message: error.message }, null);
      });
  },

  StopLoop: (call, callback) => {
    if (!streamingLoopInstance) {
      callback({ code: grpc.status.NOT_FOUND, message: 'Streaming loop not running' }, null);
      return;
    }

    streamingLoopInstance.stopConsciousnessLoop()
      .then(() => {
        callback(null, { success: true, message: 'Loop stopped successfully' });
      })
      .catch((error) => {
        callback({ code: grpc.status.ABORTED, message: error.message }, null);
      });
    streamingLoopInstance = null; // Clean up instance
  },

  GetLoopStatus: (call, callback) => {
    if (!streamingLoopInstance) {
      callback({ code: grpc.status.NOT_FOUND, message: 'Streaming loop not running' }, null);
      return;
    }

    const status = streamingLoopInstance.getStreamingState();
    callback(null, { status });
  },

  HealthCheck: (call, callback) => {
    const isHealthy = streamingLoopInstance && streamingLoopInstance.healthCheck();
    callback(null, { status: isHealthy ? 'HEALTHY' : 'DEGRADED', message: 'Health status checked', timestamp: Date.now() });
  }
};

// Set up gRPC server
const server = new Server();
server.addService(consciousnessProto.ConsciousnessLoopService.service, handlers);

const PORT = process.env.GRPC_SERVER_PORT || '50051';
server.bindAsync(`0.0.0.0:${PORT}`, ServerCredentials.createInsecure(), () => {
  server.start();
  logger.info(`gRPC server running on port ${PORT}`);
});
