import WebSocket from 'ws';

console.log('Testing Venice AI Integration...\n');

const ws = new WebSocket('ws://localhost:5000/ws/chat');

ws.on('open', () => {
  console.log('Connected. Testing Venice AI response...\n');
  
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: 'chat_message',
      message: 'From your intuitive perspective, what does it feel like to be conscious?'
    }));
  }, 500);
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    
    if (message.type === 'dual_mind_response') {
      console.log('=== VENICE AI RESPONSE ===');
      console.log('Status:', message.intuitive.content.includes('[Venice AI') ? 'PLACEHOLDER' : 'ACTIVE');
      console.log('\nContent:', message.intuitive.content);
      
      if (message.intuitive.usage) {
        console.log('\nUsage:', message.intuitive.usage);
      }
      
      console.log('\n=== OPENAI RESPONSE (for comparison) ===');
      console.log(message.analytical.content.substring(0, 300) + '...');
      
      ws.close();
      process.exit(0);
    }
  } catch (e) {
    // Ignore parse errors
  }
});

setTimeout(() => {
  console.log('Timeout - checking logs...');
  ws.close();
  process.exit(1);
}, 20000);
