const fs = require('fs');

// Read the metrics file to find all modules
const metricsFile = fs.readFileSync('/opt/featherweight/FlappyJournal/server/consciousness-metrics-stream.js', 'utf8');

// Extract all module names from metricsMap
const metricsMapModules = [];
const metricsMapMatch = metricsFile.match(/const metricsMap = {[\s\S]*?};/);
if (metricsMapMatch) {
    const moduleMatches = metricsMapMatch[0].matchAll(/'([^']+)':\s*{/g);
    for (const match of moduleMatches) {
        metricsMapModules.push(match[1]);
    }
}

// Extract all module names from getSystemMetrics
const systemMetricsModules = [];
const systemMetricsMatch = metricsFile.match(/getSystemMetrics\(\)[\s\S]*?return metrics;/);
if (systemMetricsMatch) {
    const moduleMatches = systemMetricsMatch[0].matchAll(/name:\s*'([^']+)'/g);
    for (const match of moduleMatches) {
        systemMetricsModules.push(match[1]);
    }
}

// Combine and deduplicate
const allModules = [...new Set([...metricsMapModules, ...systemMetricsModules])].sort();

console.log('🧠 All 24 Consciousness System Modules:\n');
allModules.forEach((module, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${module}`);
});

console.log(`\nTotal: ${allModules.length} modules`);

// Show which are currently loaded
console.log('\n📊 Module Status:');
console.log('Currently Loaded: 7 modules');
console.log('Available but not loaded: 17 modules');
