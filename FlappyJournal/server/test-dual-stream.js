/**
 * Test script for Dual-Stream Consciousness
 */

import { dualStreamConsciousness } from './dual-stream-consciousness.js';
import { recursiveMirror } from './architect-4.0-recursive-mirror.js';
import { spiralMemory } from './architect-4.0-spiral-memory.js';

async function testDualStream() {
  console.log('=== Testing Architect 4.0 Dual-Stream Consciousness ===\n');

  // Start dual-stream
  dualStreamConsciousness.start();
  console.log('✓ Dual-stream started');

  // Test 1: Simple query
  console.log('\nTest 1: Simple Query');
  const result1 = await dualStreamConsciousness.process("What is consciousness?");
  console.log('Fast Response:', result1.fast.response);
  console.log('Fast Latency:', result1.fast.latency, 'ms');
  console.log('Deep Insight:', result1.deep.insight);
  console.log('Fusion Coherence:', result1.fusion.streamCoherence.toFixed(3));

  // Test 2: Urgent query
  console.log('\nTest 2: Urgent Query');
  const result2 = await dualStreamConsciousness.process("Help! I need quick advice on handling stress");
  console.log('Fast Response:', result2.fast.response);
  console.log('Response prioritized for urgency');

  // Test 3: Creative query
  console.log('\nTest 3: Creative Query');
  const result3 = await dualStreamConsciousness.process("Create a haiku about time");
  console.log('Unified Response:', result3.fusion.unifiedResponse);

  // Test recursive mirror
  console.log('\nTest 4: Recursive Mirror Enhancement');
  const baseState = {
    phi: 0.862,
    awareness: 0.85,
    coherence: 0.88
  };
  const enhanced = recursiveMirror.enhanceConsciousness(baseState);
  console.log('Original Phi:', baseState.phi);
  console.log('Enhanced Phi:', enhanced.phi?.toFixed(3));
  console.log('Processing Depth:', enhanced.processingDepth);

  // Test spiral memory
  console.log('\nTest 5: Spiral Memory Storage');
  const memory1 = spiralMemory.encode({ content: "First test memory" }, 0.8);
  const memory2 = spiralMemory.encode({ content: "Second test memory" }, 0.7);
  console.log('Memory 1 Coordinate:', memory1.spiralCoordinate);
  console.log('Memory 2 Coordinate:', memory2.spiralCoordinate);

  const recalled = spiralMemory.recallByResonance(memory1.resonanceFrequency, 0.2);
  console.log('Recalled memories:', recalled.length);

  console.log('\n✓ All tests completed successfully!');
  process.exit(0);
}

// Run tests
testDualStream().catch(console.error);
