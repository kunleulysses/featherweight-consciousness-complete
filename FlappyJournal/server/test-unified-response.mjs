import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3001');
let responseReceived = false;

ws.on('open', () => {
  console.log('Connected to WebSocket server');
  
  // Send a test chat message
  ws.send(JSON.stringify({
    type: 'chat_message',
    message: 'Show me your dual consciousness - both analytical and intuitive minds working together.'
  }));
  
  console.log('Sent test message');
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  console.log('Received message type:', msg.type);
  
  if ((msg.type === 'unified_response' || msg.type === 'chat_response') && !responseReceived) {
    responseReceived = true;
    console.log('\n=== CHAT RESPONSE RECEIVED ===');
    console.log('Unified content:', msg.unifiedContent?.substring(0, 200) + '...');
    console.log('\nFull response structure:');
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
  console.log('Timeout - no response received');
  ws.close();
  process.exit(1);
}, 30000);
