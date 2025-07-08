const WebSocket = require('ws');

console.log('🧪 Simple Consciousness Test');
console.log('============================');

const ws = new WebSocket('ws://localhost:3002');

ws.on('open', () => {
  console.log('✅ Connected');
  console.log('📤 Sending: "Hello"');
  
  ws.send(JSON.stringify({
    type: 'chat',
    content: 'Hello',
    timestamp: new Date().toISOString()
  }));
});

ws.on('message', (data) => {
  try {
    const response = JSON.parse(data.toString());
    if (response.type === 'response') {
      console.log('📨 RESPONSE RECEIVED:');
      console.log('-------------------');
      console.log(response.content);
      console.log('-------------------');
      console.log('✅ Success!');
      ws.close();
      process.exit(0);
    }
  } catch (e) {
    // Ignore
  }
});

ws.on('error', (err) => {
  console.log('❌ Error:', err.message);
  process.exit(1);
});

setTimeout(() => {
  console.log('⏰ Timeout');
  process.exit(1);
}, 15000);
