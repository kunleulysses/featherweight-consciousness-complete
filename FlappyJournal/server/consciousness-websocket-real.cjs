const WebSocket = require('ws');
const { consciousnessSystem } = require('./consciousness-system-integration.cjs');

function setupConsciousnessWebSocket(server) {
  console.log('🔌 Setting up Consciousness WebSocket endpoints...');
  
  // Create WebSocket servers for each stream
  const wss = new WebSocket.Server({ 
    server,
    path: '/consciousness-stream'
  });

  const healthWss = new WebSocket.Server({
    server,
    path: '/health-stream'
  });

  const goalsWss = new WebSocket.Server({
    server,
    path: '/goals-stream'
  });

  const orchestrationWss = new WebSocket.Server({
    server,
    path: '/orchestration-stream'
  });

  // Connect WebSocket servers to consciousness system
  consciousnessSystem.setWebSocketConnection('consciousness', wss);
  consciousnessSystem.setWebSocketConnection('health', healthWss);
  consciousnessSystem.setWebSocketConnection('goals', goalsWss);
  consciousnessSystem.setWebSocketConnection('orchestration', orchestrationWss);

  // Initialize the consciousness system
  consciousnessSystem.initialize().then(() => {
    console.log('🎉 Consciousness system initialized and connected to WebSocket!');
  }).catch(error => {
    console.error('❌ Failed to initialize consciousness system:', error);
  });

  // Set up periodic updates
  setInterval(() => {
    // Broadcast system metrics every 2 seconds
    consciousnessSystem.broadcastToWebSocket('consciousness', {
      type: 'system-metrics',
      metrics: consciousnessSystem.getSystemMetrics()
    });
  }, 2000);

  // Handle manual checkpoint requests
  wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'checkpoint-request') {
          await consciousnessSystem.createCheckpoint(data.reason || 'manual');
          ws.send(JSON.stringify({
            type: 'checkpoint-created',
            timestamp: Date.now()
          }));
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down consciousness system...');
    await consciousnessSystem.shutdown();
    process.exit(0);
  });

  console.log('✅ Consciousness WebSocket endpoints ready');
}

module.exports = { setupConsciousnessWebSocket };
