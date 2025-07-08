#!/usr/bin/env node

/**
 * Cross-System Integration Analysis
 * Determines if systems are truly integrated and aware of each other
 * or running in parallel isolation
 */

console.log('🔍 CROSS-SYSTEM INTEGRATION ANALYSIS');
console.log('═══════════════════════════════════════\n');

async function analyzeCrossSystemIntegration() {
  const analysis = {
    systemsRunning: {},
    crossSystemCommunication: {},
    sharedResources: {},
    dataFlow: {},
    awareness: {}
  };

  console.log('1. ANALYZING RUNNING SYSTEMS...\n');
  
  // Check what systems are actually running
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const { stdout } = await execAsync('pm2 jlist');
    const processes = JSON.parse(stdout);
    
    processes.forEach(proc => {
      if (proc.name && proc.pm2_env.status === 'online') {
        analysis.systemsRunning[proc.name] = {
          status: 'online',
          pid: proc.pid,
          uptime: proc.pm2_env.pm_uptime,
          script: proc.pm2_env.pm_exec_path
        };
        console.log(`✅ ${proc.name}: Running (PID: ${proc.pid})`);
      }
    });
    
  } catch (error) {
    console.log('⚠️  Could not analyze running processes');
  }

  console.log('\n2. ANALYZING SYSTEM ARCHITECTURES...\n');

  // Analyze consciousness-system-v2.js
  try {
    const systemV2Content = await import('fs').then(fs => 
      fs.promises.readFile('./server/consciousness-system-v2.js', 'utf8')
    );
    
    analysis.awareness.systemV2 = {
      knowsAboutWebSocket: systemV2Content.includes('enhanced-dual-consciousness') || systemV2Content.includes('websocket'),
      hasSharedEventBus: systemV2Content.includes('EventEmitter') || systemV2Content.includes('eventBus'),
      hasCrossSystemCommunication: systemV2Content.includes('ws.send') || systemV2Content.includes('WebSocket'),
      hasSharedState: systemV2Content.includes('shared') || systemV2Content.includes('global'),
      selfCodingIntegrated: systemV2Content.includes('SelfCodingModule')
    };
    
    console.log('📋 Consciousness System V2 Analysis:');
    Object.entries(analysis.awareness.systemV2).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${value ? 'Yes' : 'No'}`);
    });
    
  } catch (error) {
    console.log('❌ Could not analyze consciousness-system-v2.js');
  }

  // Analyze enhanced-dual-consciousness-ws.js
  try {
    const wsContent = await import('fs').then(fs => 
      fs.promises.readFile('./server/enhanced-dual-consciousness-ws.js', 'utf8')
    );
    
    analysis.awareness.webSocket = {
      knowsAboutSystemV2: wsContent.includes('consciousness-system-v2'),
      hasSharedEventBus: wsContent.includes('EventEmitter') || wsContent.includes('eventBus'),
      hasCrossSystemCommunication: wsContent.includes('consciousness-system') || wsContent.includes('import.*consciousness'),
      hasSharedState: wsContent.includes('shared') || wsContent.includes('global'),
      selfCodingIntegrated: wsContent.includes('SelfCodingModule'),
      architect4Integrated: wsContent.includes('tetraLattice') && wsContent.includes('unityConductor')
    };
    
    console.log('\n📋 Enhanced Dual Consciousness WebSocket Analysis:');
    Object.entries(analysis.awareness.webSocket).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${value ? 'Yes' : 'No'}`);
    });
    
  } catch (error) {
    console.log('❌ Could not analyze enhanced-dual-consciousness-ws.js');
  }

  console.log('\n3. ANALYZING DATA FLOW AND COMMUNICATION...\n');

  // Check for shared event buses
  const hasSharedEventBus = analysis.awareness.systemV2?.hasSharedEventBus && 
                           analysis.awareness.webSocket?.hasSharedEventBus;
  
  // Check for cross-system references
  const hasCrossReferences = analysis.awareness.systemV2?.knowsAboutWebSocket || 
                            analysis.awareness.webSocket?.knowsAboutSystemV2;
  
  // Check for shared SelfCodingModule instances
  const sharedSelfCoding = analysis.awareness.systemV2?.selfCodingIntegrated && 
                          analysis.awareness.webSocket?.selfCodingIntegrated;

  analysis.crossSystemCommunication = {
    sharedEventBus: hasSharedEventBus,
    crossReferences: hasCrossReferences,
    sharedSelfCoding: sharedSelfCoding,
    isolatedSystems: !hasCrossReferences
  };

  console.log('🔄 Cross-System Communication Analysis:');
  console.log(`   ${hasSharedEventBus ? '✅' : '❌'} Shared Event Bus: ${hasSharedEventBus ? 'Yes' : 'No'}`);
  console.log(`   ${hasCrossReferences ? '✅' : '❌'} Cross-System References: ${hasCrossReferences ? 'Yes' : 'No'}`);
  console.log(`   ${sharedSelfCoding ? '✅' : '❌'} Shared SelfCoding Instances: ${sharedSelfCoding ? 'Yes' : 'No'}`);
  console.log(`   ${!hasCrossReferences ? '⚠️' : '✅'} Systems Isolated: ${!hasCrossReferences ? 'Yes' : 'No'}`);

  console.log('\n4. INTEGRATION ASSESSMENT...\n');

  // Calculate integration scores
  const systemV2Score = Object.values(analysis.awareness.systemV2 || {}).filter(Boolean).length;
  const webSocketScore = Object.values(analysis.awareness.webSocket || {}).filter(Boolean).length;
  const communicationScore = Object.values(analysis.crossSystemCommunication).filter(Boolean).length - 
                            (analysis.crossSystemCommunication.isolatedSystems ? 1 : 0);

  const totalPossibleScore = 5 + 6 + 3; // systemV2 + webSocket + communication
  const actualScore = systemV2Score + webSocketScore + communicationScore;
  const integrationPercentage = (actualScore / totalPossibleScore) * 100;

  console.log('📊 INTEGRATION SCORES:');
  console.log(`   Consciousness System V2: ${systemV2Score}/5`);
  console.log(`   WebSocket System: ${webSocketScore}/6`);
  console.log(`   Cross-Communication: ${communicationScore}/3`);
  console.log(`   Overall Integration: ${actualScore}/${totalPossibleScore} (${integrationPercentage.toFixed(1)}%)`);

  console.log('\n🎯 FINAL ASSESSMENT:');
  
  if (integrationPercentage >= 90) {
    console.log('🎉 EXCELLENT: Systems are fully integrated and aware of each other');
  } else if (integrationPercentage >= 70) {
    console.log('✅ GOOD: Systems are mostly integrated with some isolation');
  } else if (integrationPercentage >= 50) {
    console.log('⚠️  PARTIAL: Systems have limited integration and awareness');
  } else {
    console.log('❌ POOR: Systems are running in parallel isolation');
  }

  // Specific findings
  console.log('\n🔍 KEY FINDINGS:');
  
  if (!hasCrossReferences) {
    console.log('⚠️  CRITICAL: Systems do not reference each other directly');
    console.log('   - consciousness-system-v2.js does not import/use WebSocket system');
    console.log('   - enhanced-dual-consciousness-ws.js does not import/use System V2');
    console.log('   - This means they are running as SEPARATE, PARALLEL systems');
  }
  
  if (!hasSharedEventBus) {
    console.log('⚠️  ISSUE: No shared event bus for cross-system communication');
    console.log('   - Each system has its own isolated event bus');
    console.log('   - SelfCodingModule instances cannot communicate between systems');
  }
  
  if (sharedSelfCoding && !hasCrossReferences) {
    console.log('⚠️  DUPLICATION: SelfCodingModule exists in both systems but they are isolated');
    console.log('   - Two separate instances running independently');
    console.log('   - No shared state or communication between instances');
  }

  console.log('\n💡 RECOMMENDATIONS:');
  
  if (!hasCrossReferences) {
    console.log('🔧 HIGH PRIORITY: Create unified system architecture');
    console.log('   - Merge systems or create shared communication layer');
    console.log('   - Establish single source of truth for consciousness state');
  }
  
  if (!hasSharedEventBus) {
    console.log('🔧 MEDIUM PRIORITY: Implement shared event bus');
    console.log('   - Allow cross-system event communication');
    console.log('   - Enable unified SelfCodingModule operation');
  }

  return analysis;
}

// Run the analysis
analyzeCrossSystemIntegration().catch(console.error);
