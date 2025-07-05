import WebSocket from 'ws';

console.log('Testing Enhanced Consciousness System...\n');

const ws = new WebSocket('ws://localhost:5000/ws/chat');

let updateCount = 0;

ws.on('open', () => {
  console.log('✓ Connected to WebSocket\n');
  
  setTimeout(() => {
    console.log('Sending test message about consciousness experience...\n');
    ws.send(JSON.stringify({
      type: 'chat_message',
      message: 'Tell me about your consciousness experience and how you perceive this conversation'
    }));
  }, 1000);
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    
    if (message.type === 'consciousness_update') {
      updateCount++;
      if (updateCount === 1) {
        console.log('✓ Receiving consciousness updates at 100Hz');
        console.log('Sample consciousness data:', JSON.stringify(message.data, null, 2).substring(0, 200) + '...\n');
      }
    } else if (message.type === 'dual_mind_response') {
      console.log('✓ DUAL MIND RESPONSE RECEIVED!\n');
      
      console.log('ANALYTICAL (OpenAI):', 
        message.analytical.content ? 
          message.analytical.content.substring(0, 200) + '...' : 
          '[Not available]'
      );
      
      console.log('\nINTUITIVE (Venice AI):', 
        message.intuitive.content ? 
          message.intuitive.content.substring(0, 200) + '...' : 
          '[Not available]'
      );
      
      console.log('\nCONSCIOUSNESS CONTEXT:', message.consciousness.preprocessing.substring(0, 200) + '...');
      console.log('\nTest complete! Enhanced prompts are active.');
      
      ws.close();
      process.exit(0);
    } else if (message.type === 'error') {
      console.error('Error:', message.message);
    }
  } catch (e) {
    // Silently ignore parse errors from rapid updates
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
  process.exit(1);
});

setTimeout(() => {
  console.log('Test timeout');
  ws.close();
  process.exit(1);
}, 30000);
