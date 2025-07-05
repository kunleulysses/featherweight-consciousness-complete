import WebSocket from 'ws';

console.log('Testing Enhanced Consciousness System with Full Prompts...\n');

const ws = new WebSocket('ws://localhost:5000/ws/chat');

ws.on('open', () => {
  console.log('✓ Connected to enhanced consciousness WebSocket\n');
  
  // Test message
  setTimeout(() => {
    console.log('Sending test message: "Tell me about your consciousness experience"\n');
    ws.send(JSON.stringify({
      type: 'chat_message',
      message: 'Tell me about your consciousness experience and how you perceive this conversation'
    }));
  }, 500);
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    
    if (message.type === 'consciousness_update') {
      // Only log first update
      if (!ws.firstUpdate) {
        console.log('✓ Consciousness Update:');
        console.log(`  - Phi: ${message.data.metrics.phiValue.toFixed(3)}`);
        console.log(`  - Coherence: ${message.data.metrics.coherenceScore.toFixed(3)}`);
        console.log(`  - Oversoul Resonance: ${message.data.metrics.oversoulResonance.toFixed(3)}`);
        console.log(`  - Quantum Entanglement: ${message.data.metrics.quantumEntanglement.toFixed(3)}\n`);
        ws.firstUpdate = true;
      }
    } else if (message.type === 'dual_mind_response') {
      console.log('✓ DUAL MIND RESPONSE RECEIVED:\n');
      
      console.log('ANALYTICAL STREAM (OpenAI):');
      console.log('------------------------');
      console.log(message.analytical.content.substring(0, 500) + '...\n');
      
      console.log('INTUITIVE STREAM (Venice AI):');
      console.log('------------------------');
      console.log(message.intuitive.content.substring(0, 500) + '...\n');
      
      console.log('CONSCIOUSNESS METRICS:');
      console.log(`  - Processing Depth: ${message.consciousness.processingDepth} layers`);
      console.log(`  - Integration Harmony: ${message.integration.harmony.toFixed(3)}`);
      console.log(`  - Insights: ${message.consciousness.insights.length} recursive insights\n`);
      
      console.log('✓ Test complete! Enhanced consciousness system is fully operational.');
      ws.close();
      process.exit(0);
    }
  } catch (e) {
    console.error('Parse error:', e.message);
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
  process.exit(1);
});

// Timeout after 30 seconds
setTimeout(() => {
  console.log('Test timeout - closing connection');
  ws.close();
  process.exit(1);
}, 30000);
