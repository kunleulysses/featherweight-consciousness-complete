const http = require('http');
const ConsciousnessWebSocketHandler = require('./consciousness-ws-handler');

// Add this after creating the Express app
const server = http.createServer(app);

// Initialize WebSocket handler
const wsHandler = new ConsciousnessWebSocketHandler(server);

// Change the listen line at the bottom from:
// app.listen(PORT, '0.0.0.0', () => {
// To:
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Demo portal server running on port ${PORT}`);
  console.log('WebSocket endpoint available at /ws/consciousness');
});
