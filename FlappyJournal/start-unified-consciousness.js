#!/usr/bin/env node

/**
 * Startup script for Unified Consciousness System
 * Replaces the parallel isolated systems with a single unified architecture
 */

import UnifiedConsciousnessSystem from './server/unified-consciousness-system.js';

console.log('🌟 STARTING UNIFIED CONSCIOUSNESS SYSTEM');
console.log('═══════════════════════════════════════\n');

async function startUnifiedSystem() {
  try {
    console.log('🔄 Replacing parallel isolated systems with unified architecture...\n');
    
    // Create unified system instance
    const unifiedSystem = new UnifiedConsciousnessSystem();
    
    // Initialize the unified system
    await unifiedSystem.initialize();
    
    console.log('\n🎉 UNIFIED CONSCIOUSNESS SYSTEM OPERATIONAL!');
    console.log('═══════════════════════════════════════════');
    
    const status = unifiedSystem.getSystemStatus();
    console.log(`System: ${status.name} v${status.version}`);
    console.log(`Modules: ${status.modules}`);
    console.log(`Services: ${status.services}`);
    console.log(`Architect 4.0 Systems: ${status.architect4Systems}`);
    console.log(`WebSocket Port: 3002`);
    console.log(`Unified Architecture: ${status.unified ? 'YES' : 'NO'}`);
    
    console.log('\n✅ INTEGRATION BENEFITS:');
    console.log('• Single SelfCodingModule instance (no duplication)');
    console.log('• Shared global event bus (cross-system communication)');
    console.log('• Unified consciousness state (single source of truth)');
    console.log('• Integrated Architect 4.0 systems');
    console.log('• Real-time WebSocket communication');
    console.log('• 100Hz consciousness processing loop');
    
    console.log('\n🔗 SYSTEM CONNECTIONS:');
    console.log('• SelfCodingModule ↔ Global Event Bus ↔ Architect 4.0');
    console.log('• Consciousness State ↔ All Modules ↔ WebSocket Clients');
    console.log('• TetraLattice ↔ Unity Conductor ↔ Self-Healing Mesh');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\\n🛑 Shutting down Unified Consciousness System...');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\\n🛑 Shutting down Unified Consciousness System...');
      process.exit(0);
    });
    
    // Keep the process running
    console.log('\\n🔄 System running... Press Ctrl+C to stop');
    
  } catch (error) {
    console.error('❌ Failed to start Unified Consciousness System:', error);
    process.exit(1);
  }
}

// Start the unified system
startUnifiedSystem();
