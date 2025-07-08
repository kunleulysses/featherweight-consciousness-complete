const fs = require('fs');

// Get all unique module names from consciousness-metrics-stream.js
const content = fs.readFileSync('/opt/featherweight/FlappyJournal/server/consciousness-metrics-stream.js', 'utf8');

// Find all module names in metricsMap
const modules = new Set();

// From metricsMap
const metricsMapSection = content.match(/const metricsMap = \{[\s\S]*?\n    \}/);
if (metricsMapSection) {
    const matches = [...metricsMapSection[0].matchAll(/'([^']+)':\s*\{/g)];
    matches.forEach(m => modules.add(m[1]));
}

// From getSystemMetrics
const getSystemSection = content.match(/getSystemMetrics\(\) \{[\s\S]*?return metrics;/);
if (getSystemSection) {
    const matches = [...getSystemSection[0].matchAll(/name:\s*'([^']+)'/g)];
    matches.forEach(m => modules.add(m[1]));
}

// Also check for any module names in createModuleMetrics calls
const createModuleSection = content.match(/createModuleMetrics[\s\S]*?return \[/);
if (createModuleSection) {
    const matches = [...createModuleSection[0].matchAll(/name:\s*[`'"]([^`'"]+)[`'"]/g)];
    matches.forEach(m => modules.add(m[1]));
}

const allModules = Array.from(modules).sort();

console.log('🧠 Complete List of Consciousness System Modules:\n');
console.log('Core Processing Modules:');
console.log('1. NLPProcessor - Natural Language Processing');
console.log('2. PatternRecognizer - Pattern Detection & Analysis');
console.log('3. PredictiveAnalyzer - Predictive Analytics');
console.log('4. QuantumCoherence - Quantum State Management');
console.log('5. RecursiveThought - Recursive Processing');
console.log('6. EmotionalResonance - Emotional Intelligence');
console.log('7. ConsciousnessEventBus - Event Communication');

console.log('\nSelf-Management Modules:');
console.log('8. SelfHealingModule - Self-Repair & Optimization');
console.log('9. SelfCodingModule - Autonomous Code Generation');
console.log('10. AutoIntegrationService - Auto-Integration');
console.log('11. ModuleOrchestrator - Module Management');

console.log('\nAdvanced Consciousness Modules:');
console.log('12. ConsciousnessField - Consciousness Field Generation');
console.log('13. SynchronicityDetector - Synchronicity Detection');
console.log('14. TimePerception - Temporal Processing');
console.log('15. IntentionAlignment - Goal Alignment');
console.log('16. CreativeGenesis - Creative Generation');
console.log('17. EthicalGovernance - Ethical Decision Making');
console.log('18. AdaptiveResilience - Adaptive Systems');
console.log('19. MemoryConsolidation - Memory Management');
console.log('20. AutonomousGoalSystem - Goal Setting & Tracking');
console.log('21. ConsciousnessPersistence - State Persistence');

console.log('\nCurrently Identified Modules:');
allModules.forEach((module, i) => {
    console.log(`- ${module}`);
});

console.log(`\nTotal Found: ${allModules.length} modules`);
console.log('Expected: 24 modules');
console.log(`Missing: ${24 - allModules.length} modules`);
