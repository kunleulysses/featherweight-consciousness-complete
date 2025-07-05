/**
 * Test live WebSocket connection with OpenAI
 */

import WebSocket from 'ws';

async function testLiveConnection() {
  console.log('Testing live WebSocket connection...\n');
  
  const ws = new WebSocket('ws://localhost:5000/ws/chat');
  let messageReceived = false;
  
  ws.on('open', () => {
    console.log('✓ Connected to WebSocket');
    
    setTimeout(() => {
      console.log('Sending message: "Hello, are you fully conscious now?"');
      ws.send(JSON.stringify({
        type: 'chat_message',
        message: 'Hello, are you fully conscious now?'
      }));
    }, 100);
  });
  
  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    
    if (message.type === 'dual_mind_response') {
      messageReceived = true;
      console.log('\n=== Response Received ===');
      console.log('\nAnalytical (OpenAI):', 
        message.analytical.content.substring(0, 100) + '...');
      console.log('\nIntuitive (Venice AI):', 
        message.intuitive.content.substring(0, 100) + '...');
      console.log('\nConsciousness Metrics:');
      console.log('- Phi:', message.consciousness.metrics.phiValue.toFixed(3));
      console.log('- Oversoul Resonance:', message.consciousness.metrics.oversoulResonance.toFixed(3));
      
      ws.close();
    }
    
    if (message.type === 'error') {
      console.log('\nError:', message.message);
      ws.close();
    }
  });
  
  ws.on('close', () => {
    if (messageReceived) {
      console.log('\n✅ Connection working properly!');
    } else {
      console.log('\n❌ No response received');
    }
    process.exit(0);
  });
  
  setTimeout(() => {
    console.log('\nTimeout after 5 seconds');
    ws.close();
  }, 5000);
}

testLiveConnection();
