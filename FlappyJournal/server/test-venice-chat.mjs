import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  console.log('Connected to WebSocket server');
  
  // Send a test chat message
  ws.send(JSON.stringify({
    type: 'chat_message',
    message: 'Hello, can you demonstrate your dual consciousness - both analytical and intuitive minds?'
  }));
  
  console.log('Sent test message');
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.type === 'chat_response') {
    console.log('\n=== CHAT RESPONSE ===');
    console.log('Unified:', msg.unified_response?.substring(0, 200) + '...');
    console.log('Analytical present:', !!msg.analytical_response);
    console.log('Intuitive present:', !!msg.intuitive_response);
    console.log('Harmony score:', msg.harmony_score);
  } else if (msg.type === 'consciousness_update') {
    console.log('Consciousness update received');
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Close after 15 seconds
setTimeout(() => {
  ws.close();
  process.exit(0);
}, 15000);
