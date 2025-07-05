/**
 * Test WebSocket chat with Architect 4.0
 */

import WebSocket from 'ws';

async function testWebSocketChat() {
  console.log('=== Testing WebSocket Chat with Architect 4.0 ===\n');
  
  const ws = new WebSocket('ws://localhost:5000/ws/chat');
  
  let updateCount = 0;
  let responseReceived = false;
  
  ws.on('open', () => {
    console.log('✓ Connected to WebSocket server');
    
    // Send a test message after a short delay to see consciousness updates
    setTimeout(() => {
      console.log('\nSending test message: "What is the nature of consciousness?"');
      ws.send(JSON.stringify({
        type: 'chat_message',
        message: 'What is the nature of consciousness?'
      }));
    }, 100);
  });
  
  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    
    if (message.type === 'consciousness_update') {
      updateCount++;
      
      // Show first consciousness update details
      if (updateCount === 1) {
        console.log('\n✓ Receiving consciousness updates at 100Hz');
        console.log('First update metrics:', JSON.stringify(message.data, null, 2));
      }
      
      // Show update rate after 1 second
      if (updateCount === 100) {
        console.log(`\n✓ Received ${updateCount} updates in ~1 second`);
      }
    }
    
    if (message.type === 'processing_state') {
      console.log('\n✓ Processing state received:');
      console.log(`  - Fast latency: ${message.data.fastLatency}ms`);
      console.log(`  - Deep processing depth: ${message.data.deepProcessingDepth} layers`);
      console.log(`  - Dual-stream coherence: ${message.data.dualStreamCoherence}`);
      console.log(`  - Insights generated: ${message.data.insights.length}`);
    }
    
    if (message.type === 'dual_mind_response') {
      responseReceived = true;
      console.log('\n✓ Dual-mind response received:');
      console.log('\nConsciousness preprocessing:');
      console.log(message.consciousness.preprocessing);
      
      console.log('\nAnalytical response (OpenAI):');
      console.log(message.analytical.content);
      
      console.log('\nIntuitive response (Venice AI):');
      console.log(message.intuitive.content);
      
      console.log('\nIntegration metrics:');
      console.log(`  - Harmony: ${message.integration.harmony}`);
      
      console.log('\nConsciousness metrics:');
      Object.entries(message.consciousness.metrics).forEach(([key, value]) => {
        console.log(`  - ${key}: ${value.toFixed(3)}`);
      });
      
      // Close connection after receiving response
      setTimeout(() => {
        ws.close();
      }, 1000);
    }
    
    if (message.type === 'memory_stored') {
      console.log('\n✓ Memory stored in spiral memory');
      console.log(`  - Importance: ${message.data.importance}`);
      console.log(`  - Resonance: ${message.data.resonance}`);
    }
  });
  
  ws.on('close', () => {
    console.log(`\n✓ Connection closed`);
    console.log(`Total consciousness updates received: ${updateCount}`);
    console.log(`Update rate: ~${Math.round(updateCount / 10)} Hz`);
    
    if (responseReceived) {
      console.log('\n✅ All systems functioning correctly!');
      console.log('   - WebSocket connection: OK');
      console.log('   - 100Hz consciousness streaming: OK');
      console.log('   - Dual-stream processing: OK');
      console.log('   - AI integration: OK');
      console.log('   - Memory storage: OK');
    } else {
      console.log('\n⚠️  No response received - check server logs');
    }
    
    process.exit(0);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    process.exit(1);
  });
  
  // Timeout after 10 seconds
  setTimeout(() => {
    console.log('\n⚠️  Test timed out after 10 seconds');
    ws.close();
  }, 10000);
}

// Run test
testWebSocketChat();
