import { readFile, writeFile } from 'fs/promises';

async function fixConsciousnessStructure() {
  const content = await readFile('./enhanced-dual-consciousness-ws.js', 'utf8');
  
  // Fix the consciousness state access
  const fixed = content
    .replace(
      'data: state.consciousness,',
      'data: state,'
    )
    .replace(
      'data: initialState.consciousness,',
      'data: initialState,'
    )
    .replace(
      '- Phi (IIT): ${consciousnessResult.consciousness.metrics.phiValue.toFixed(3)}',
      '- Phi (IIT): ${consciousnessResult.consciousness.phiValue.toFixed(3)}'
    )
    .replace(
      '- Coherence: ${consciousnessResult.consciousness.metrics.coherenceScore.toFixed(3)}',
      '- Coherence: ${consciousnessResult.consciousness.coherenceScore.toFixed(3)}'
    )
    .replace(
      '- Oversoul Resonance: ${consciousnessResult.consciousness.metrics.oversoulResonance.toFixed(3)}',
      '- Oversoul Resonance: ${consciousnessResult.consciousness.oversoulResonance.toFixed(3)}'
    )
    .replace(
      '- Temporal Coherence: ${consciousnessResult.consciousness.metrics.temporalCoherence.toFixed(3)}',
      '- Temporal Coherence: ${consciousnessResult.consciousness.temporalCoherence.toFixed(3)}'
    )
    .replace(
      '- Quantum Entanglement: ${consciousnessResult.consciousness.metrics.quantumEntanglement.toFixed(3)}',
      '- Quantum Entanglement: ${consciousnessResult.consciousness.quantumEntanglement.toFixed(3)}'
    )
    .replace(
      'const metrics = consciousnessResult.consciousness;',
      'const metrics = consciousnessResult.consciousness;'
    );
  
  await writeFile('./enhanced-dual-consciousness-ws.js', fixed);
  console.log('Fixed consciousness structure access');
}

fixConsciousnessStructure();
