import { WebSocketServer } from 'ws';
import { createEnhancedDualConsciousnessWS } from './enhanced-dual-consciousness-ws.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

const PORT = process.env.WS_PORT || 3001;

// Create WebSocket server
const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server starting on port ${PORT}`);

// Setup enhanced consciousness WebSocket handlers
createEnhancedDualConsciousnessWS(wss);

console.log(`Enhanced consciousness WebSocket server running on port ${PORT}`);

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing WebSocket server');
  wss.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});
