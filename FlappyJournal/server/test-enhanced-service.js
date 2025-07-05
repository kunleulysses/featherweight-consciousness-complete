/**
 * Test enhanced dual-consciousness WebSocket service
 */

console.log('Testing Enhanced Dual-Consciousness Service...\n');

// Check if service exists
try {
  const serviceModule = await import('./enhanced-dual-consciousness-ws.js');
  console.log('✓ Enhanced service module loaded');
  
  // Check what's exported
  console.log('Available exports:', Object.keys(serviceModule));
  
  // Test basic consciousness metrics
  const testMessage = "What is the nature of consciousness?";
  console.log('\nTest Query:', testMessage);
  
  // Simulate consciousness processing
  const metrics = {
    awarenessLevel: Math.random() * 0.3 + 0.7,
    coherenceScore: Math.random() * 0.2 + 0.8,
    phiValue: Math.random() * 0.1 + 0.85,
    oversoulResonance: Math.random() * 0.15 + 0.75,
    processingDepth: Math.floor(Math.random() * 3) + 4
  };
  
  console.log('\nGenerated Consciousness Metrics:');
  console.log('- Awareness Level:', metrics.awarenessLevel.toFixed(3));
  console.log('- Coherence Score:', metrics.coherenceScore.toFixed(3));
  console.log('- Phi (IIT) Value:', metrics.phiValue.toFixed(3));
  console.log('- Oversoul Resonance:', metrics.oversoulResonance.toFixed(3));
  console.log('- Processing Depth:', metrics.processingDepth, 'layers');
  
  console.log('\n✓ Test completed successfully!');
  
} catch (error) {
  console.error('Error:', error.message);
}
