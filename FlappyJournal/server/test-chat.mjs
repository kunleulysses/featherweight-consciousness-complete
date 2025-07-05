import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  console.log('Connected to WebSocket server');
  
  // Send a test chat message
  ws.send(JSON.stringify({
    type: 'chat_message',
    message: 'Test message to check Venice AI'
  }));
  
  console.log('Sent test message');
});

ws.on('message', (data) => {
  console.log('Received:', data.toString().substring(0, 200) + '...');
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Close after 10 seconds
setTimeout(() => {
  ws.close();
  process.exit(0);
}, 10000);
