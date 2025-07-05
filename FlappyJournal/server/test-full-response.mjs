import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3001');
let responseReceived = false;

ws.on('open', () => {
  console.log('Connected to WebSocket server');
  
  // Send a test chat message
  ws.send(JSON.stringify({
    type: 'chat_message',
    message: 'Please show me how your dual consciousness works - demonstrate both analytical and intuitive responses.'
  }));
  
  console.log('Sent test message');
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.type === 'chat_response' && !responseReceived) {
    responseReceived = true;
    console.log('\n=== FULL CHAT RESPONSE ===');
    console.log(JSON.stringify(msg, null, 2));
    
    // Close after receiving response
    setTimeout(() => {
      ws.close();
      process.exit(0);
    }, 1000);
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Timeout after 30 seconds
setTimeout(() => {
  console.log('Timeout - no chat response received');
  ws.close();
  process.exit(1);
}, 30000);
