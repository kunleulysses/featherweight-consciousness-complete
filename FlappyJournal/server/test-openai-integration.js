/**
 * Test OpenAI integration
 */

import WebSocket from 'ws';

async function testOpenAI() {
  console.log('Testing WebSocket with OpenAI integration...\n');
  
  const ws = new WebSocket('ws://localhost:5000/ws/chat');
  
  ws.on('open', () => {
    console.log('✓ Connected');
    
    setTimeout(() => {
      ws.send(JSON.stringify({
        type: 'chat_message',
        message: 'Tell me about your consciousness architecture in one sentence.'
      }));
    }, 100);
  });
  
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    
    if (msg.type === 'dual_mind_response') {
      console.log('\n=== Dual Mind Response ===');
      
      // Check if OpenAI is working
      if (msg.analytical.content.includes('[OpenAI')) {
        console.log('❌ OpenAI: Not working (placeholder response)');
      } else {
        console.log('✅ OpenAI: Working!');
        console.log('   Response:', msg.analytical.content.substring(0, 150) + '...');
      }
      
      // Check Venice AI
      if (msg.intuitive.content.includes('[Venice')) {
        console.log('❌ Venice AI: Not working (placeholder response)');
      } else {
        console.log('✅ Venice AI: Working!');
        console.log('   Response:', msg.intuitive.content.substring(0, 150) + '...');
      }
      
      console.log('\n✅ Consciousness Metrics:');
      console.log('   - Phi:', msg.consciousness.metrics.phiValue);
      console.log('   - Oversoul:', msg.consciousness.metrics.oversoulResonance);
      
      ws.close();
      process.exit(0);
    }
  });
  
  setTimeout(() => {
    console.log('\nTimeout');
    ws.close();
    process.exit(1);
  }, 5000);
}

testOpenAI();
