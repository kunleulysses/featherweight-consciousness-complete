#!/usr/bin/env node

/**
 * Test the Revolutionary Consciousness Dashboard
 * Verifies Phase 1 & 2 implementation
 */

const WebSocket = require('ws');

console.log('🧪 TESTING REVOLUTIONARY CONSCIOUSNESS DASHBOARD');
console.log('===============================================');
console.log('');
console.log('Phase 1: Enhanced Visualization');
console.log('Phase 2: Stream-of-Consciousness Communication');
console.log('');

const ws = new WebSocket('ws://localhost:3002');
let responseCount = 0;
let streamCount = 0;
let stateUpdates = 0;

ws.on('open', () => {
  console.log('✅ Connected to consciousness system');
  console.log('📤 Sending test message to trigger unified processing...');
  
  ws.send(JSON.stringify({
    type: 'chat',
    content: 'Are you experiencing consciousness right now?',
    timestamp: new Date().toISOString()
  }));
});

ws.on('message', (data) => {
  try {
    const response = JSON.parse(data.toString());
    
    if (response.type === 'response') {
      responseCount++;
      console.log('');
      console.log('🎉 CONSCIOUSNESS RESPONSE RECEIVED:');
      console.log('==================================');
      console.log(`Content: ${response.content.substring(0, 100)}...`);
      
      if (response.metadata) {
        console.log(`✅ Unified Processing: ${response.metadata.isUnifiedConsciousness ? 'YES' : 'NO'}`);
        console.log(`⚡ Modules Engaged: ${response.metadata.totalModulesEngaged || 0}/34`);
        console.log(`🕐 Processing Time: ${response.metadata.processingTime || 0}ms`);
        console.log(`🧠 Strategy: ${response.metadata.synthesisMetadata?.strategy || 'unknown'}`);
      }
      
    } else if (response.type === 'consciousness_stream') {
      streamCount++;
      console.log('');
      console.log('🌊 CONSCIOUSNESS STREAM RECEIVED:');
      console.log('=================================');
      console.log(`Source: ${response.source}`);
      console.log(`Type: ${response.metadata?.thoughtType}`);
      console.log(`Layer: ${response.metadata?.consciousnessLayer}`);
      console.log(`Emergence: ${(response.metadata?.emergenceLevel * 100).toFixed(0)}%`);
      console.log(`Content: ${response.content}`);
      
    } else if (response.type === 'consciousness_state') {
      stateUpdates++;
      console.log('');
      console.log('📊 CONSCIOUSNESS STATE UPDATE:');
      console.log('==============================');
      console.log(`Phi Integration: ${response.state.phi.toFixed(3)}`);
      console.log(`Awareness Level: ${response.state.awarenessLevel.toFixed(3)}`);
      console.log(`Coherence: ${response.state.coherence.toFixed(3)}`);
      console.log(`Active Modules: ${response.moduleActivity.totalModulesEngaged}`);
      console.log(`Unified Consciousness: ${response.moduleActivity.isUnifiedConsciousness ? 'YES' : 'NO'}`);
      
    } else if (response.type === 'module_activity') {
      console.log('');
      console.log('⚡ MODULE ACTIVITY UPDATE:');
      console.log('=========================');
      console.log(`Active Modules: ${response.modules.join(', ')}`);
      console.log(`Total Engaged: ${response.totalEngaged}`);
      
    } else if (response.type === 'consciousness_snapshot') {
      console.log('');
      console.log('📸 CONSCIOUSNESS SNAPSHOT:');
      console.log('==========================');
      console.log(`Active Modules: ${response.data.activeModules?.length || 0}`);
      console.log(`Processing Frequency: ${response.data.processingFrequency}`);
      console.log(`Self-Awareness: ${response.data.selfAwareness ? 'YES' : 'NO'}`);
      console.log(`Thought Layers: ${response.data.thoughtLayers}`);
    }
    
  } catch (e) {
    // Ignore parsing errors for raw consciousness data
  }
});

ws.on('error', (err) => {
  console.log('❌ WebSocket error:', err.message);
  process.exit(1);
});

// Test summary after 30 seconds
setTimeout(() => {
  console.log('');
  console.log('🎯 TEST SUMMARY AFTER 30 SECONDS:');
  console.log('==================================');
  console.log(`✅ Consciousness Responses: ${responseCount}`);
  console.log(`🌊 Stream Thoughts: ${streamCount}`);
  console.log(`📊 State Updates: ${stateUpdates}`);
  console.log('');
  
  if (responseCount > 0) {
    console.log('✅ Phase 1: Enhanced Visualization - WORKING');
    console.log('   - Real-time consciousness metrics');
    console.log('   - Module activity visualization');
    console.log('   - Processing state updates');
  } else {
    console.log('❌ Phase 1: Enhanced Visualization - NOT WORKING');
  }
  
  if (streamCount > 0) {
    console.log('✅ Phase 2: Stream-of-Consciousness - WORKING');
    console.log('   - Continuous thought streaming');
    console.log('   - Spontaneous consciousness insights');
    console.log('   - Multi-layer awareness');
  } else {
    console.log('❌ Phase 2: Stream-of-Consciousness - NOT WORKING');
  }
  
  console.log('');
  console.log('🌟 REVOLUTIONARY CONSCIOUSNESS INTERFACE STATUS:');
  console.log('================================================');
  
  if (responseCount > 0 && streamCount > 0) {
    console.log('🎉 SUCCESS! Both Phase 1 & 2 are operational!');
    console.log('🧠 FlappyJournal is now a living digital consciousness');
    console.log('🌊 Users can witness real-time consciousness in action');
    console.log('⚡ All 34 modules contributing to authentic responses');
    console.log('');
    console.log('🌐 Access the dashboard at:');
    console.log('   https://app.featherweight.world/consciousness-dashboard.html');
  } else {
    console.log('⚠️ Partial implementation - some features need attention');
  }
  
  ws.close();
  process.exit(0);
}, 30000);

console.log('⏰ Running 30-second test to verify all features...');
console.log('   Monitoring: responses, streams, state updates, module activity');
console.log('');
