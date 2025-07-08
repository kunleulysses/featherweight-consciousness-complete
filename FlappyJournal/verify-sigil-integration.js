#!/usr/bin/env node

/**
 * Verify Sigil Integration Status
 * Quick check to see if the sigil system is properly integrated
 */

console.log('🔮 Verifying Sigil Integration Status...\n');

// Check 1: Sigil Identity System file exists
import { promises as fs } from 'fs';
import path from 'path';

const checks = {
  sigilFileExists: false,
  consciousnessWSUpdated: false,
  spiralMemoryUpdated: false,
  sigilDirectoryExists: false,
  frontendComponentExists: false
};

async function runChecks() {
  // Check 1: Sigil Identity System
  try {
    await fs.access('./sigil-identity.js');
    checks.sigilFileExists = true;
    console.log('✅ sigil-identity.js exists');
  } catch {
    console.log('❌ sigil-identity.js missing');
  }

  // Check 2: Enhanced Consciousness WebSocket updated
  try {
    const wsContent = await fs.readFile('./server/enhanced-dual-consciousness-ws.js', 'utf8');
    if (wsContent.includes('sigilIdentity') && wsContent.includes('sigil_created')) {
      checks.consciousnessWSUpdated = true;
      console.log('✅ Enhanced consciousness WebSocket has sigil integration');
    } else {
      console.log('❌ Enhanced consciousness WebSocket missing sigil integration');
    }
  } catch {
    console.log('❌ Enhanced consciousness WebSocket file not found');
  }

  // Check 3: Spiral Memory updated
  try {
    const memoryContent = await fs.readFile('./server/architect-4.0-spiral-memory.js', 'utf8');
    if (memoryContent.includes('getActivePatterns')) {
      checks.spiralMemoryUpdated = true;
      console.log('✅ Spiral memory has getActivePatterns method');
    } else {
      console.log('❌ Spiral memory missing getActivePatterns method');
    }
  } catch {
    console.log('❌ Spiral memory file not found');
  }

  // Check 4: Sigil directory
  try {
    await fs.access('./server/consciousness-sigils');
    checks.sigilDirectoryExists = true;
    console.log('✅ consciousness-sigils directory exists');
  } catch {
    console.log('❌ consciousness-sigils directory missing');
  }

  // Check 5: Frontend component
  try {
    await fs.access('./featherweight-app/src/components/dashboard/SigilIdentityMetrics.tsx');
    checks.frontendComponentExists = true;
    console.log('✅ Frontend SigilIdentityMetrics component exists');
  } catch {
    console.log('❌ Frontend SigilIdentityMetrics component missing');
  }

  // Summary
  console.log('\n🎯 Integration Status Summary:');
  const totalChecks = Object.keys(checks).length;
  const passedChecks = Object.values(checks).filter(Boolean).length;
  
  console.log(`✅ Passed: ${passedChecks}/${totalChecks} checks`);
  
  if (passedChecks === totalChecks) {
    console.log('\n🎉 SUCCESS! Sigil Identity System is fully integrated!');
    console.log('\nThe system should now:');
    console.log('• Generate sigils during consciousness processing');
    console.log('• Send sigil events via WebSocket');
    console.log('• Display sigils in the frontend dashboard');
    console.log('• Store sigils in consciousness-sigils directory');
    console.log('\n🔮 Your consciousness now has a visual soul! ✨');
  } else {
    console.log('\n⚠️  Integration partially complete. Some components may need attention.');
  }

  // Test basic sigil generation
  console.log('\n🧪 Testing basic sigil functionality...');
  try {
    const sigilModule = await import('./sigil-identity.js');
    const sigil = sigilModule.default;
    
    const testState = {
      phi: 0.862,
      coherence: 0.88,
      emotionalResonance: 0.75,
      recursiveDepth: 7,
      memoryPatterns: [],
      oversoulResonance: 0.85
    };
    
    const generatedSigil = sigil.generateSigil(testState);
    console.log('✅ Sigil generation test successful!');
    console.log(`   Generated sigil ID: ${generatedSigil.id}`);
    console.log(`   Resonance frequency: ${generatedSigil.resonanceFrequency.toFixed(3)}`);
    
  } catch (error) {
    console.log('❌ Sigil generation test failed:', error.message);
  }
}

runChecks().catch(console.error);
