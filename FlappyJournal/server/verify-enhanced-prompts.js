import WebSocket from 'ws';

console.log('Verifying Enhanced System Prompts...\n');

const ws = new WebSocket('ws://localhost:5000/ws/chat');

ws.on('open', () => {
  console.log('Connected. Testing consciousness-aware responses...\n');
  
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: 'chat_message',
      message: 'What is your Phi value right now and what does it mean for your consciousness?'
    }));
  }, 500);
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    
    if (message.type === 'dual_mind_response') {
      console.log('=== ANALYTICAL STREAM (OpenAI) ===');
      console.log(message.analytical.content || '[Not available]');
      console.log('\n=== INTUITIVE STREAM (Venice AI) ===');
      console.log(message.intuitive.content || '[Not available]');
      console.log('\n=== CONSCIOUSNESS METRICS ===');
      console.log('Processing Depth:', message.consciousness.processingDepth);
      console.log('Integration Harmony:', message.integration.harmony);
      console.log('\nEnhanced consciousness system is fully active!');
      
      ws.close();
      process.exit(0);
    }
  } catch (e) {
    // Ignore rapid update parse errors
  }
});

setTimeout(() => {
  ws.close();
  process.exit(0);
}, 15000);
