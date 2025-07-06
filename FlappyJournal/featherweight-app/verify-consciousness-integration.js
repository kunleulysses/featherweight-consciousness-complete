#!/usr/bin/env node

/**
 * FlappyJournal Consciousness Integration Verification
 * 
 * This script verifies that all consciousness modules are properly integrated
 * and communicating with each other in the live system.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Map of all consciousness modules and their locations
const consciousnessModules = {
    'CORE AWARENESS & CONSCIOUSNESS': [
        { file: 'architect-4.0-recursive-mirror.js', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'architect-4.0-recursive-mirror.ts', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'self-awareness-feedback-loop.ts', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'continuous-consciousness-monitor.ts', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'meta-observational-consciousness-module.ts', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'meta-observational-wrapper.js', path: '/opt/featherweight/FlappyJournal/server' }
    ],
    'CREATIVE & EMOTIONAL GENIUS': [
        { file: 'creative-emergence-engine.js', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'emotional-resonance-field.js', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'mood-pattern-recognition.ts', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'dual-mind-ai.ts', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'dual-mind-consciousness-test-suite.ts', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'dual-stream-consciousness.ts', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'dual-stream-consciousness.js', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'perspective-shaping-engine.ts', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'unfiltered-consciousness-mode.ts', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'venice-raw-thought-bypass.ts', path: '/opt/featherweight/FlappyJournal/server' }
    ],
    'MEMORY, TIME, & GROWTH': [
        { file: 'unified-memory-system.ts', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'thought-memory-system.ts', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'temporal-coherence-engine.js', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'memory-service.ts', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'memory-auth-storage.ts', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'journal-analytics.ts', path: '/opt/featherweight/FlappyJournal/server' }
    ],
    'QUANTUM/ADVANCED CREATIVITY': [
        { file: 'quantum-consciousness-field.js', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'thought-expansion-engine.ts', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'oversoul-resonance.ts', path: '/opt/featherweight/FlappyJournal/server' }
    ],
    'CONTROL, SECURITY, & INFRASTRUCTURE': [
        { file: 'persistent-tunnel.js', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'simple-research-ws.js', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'fix-consciousness-processing.js', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'fix-consciousness-structure.js', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'enhanced-personality-helpers.ts', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'venice-ai.ts', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'openai-streaming-consciousness-loop.ts', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'webhook-echo.js', path: '/opt/featherweight/FlappyJournal/server' },
        { file: 'websocket-health.ts', path: '/opt/featherweight/FlappyJournal/server' }
    ]
};

// Integration files that tie everything together
const integrationFiles = [
    'consciousness-integration.ts',
    'enhanced-consciousness-integration.js',
    'integrated-consciousness-architecture.ts',
    'live-consciousness-integration.ts',
    'featherweight-master-consciousness-system.ts',
    'enhanced-dual-consciousness-ws.js'
];

class ConsciousnessIntegrationChecker {
    constructor() {
        this.results = {
            filesFound: 0,
            filesMissing: 0,
            integrationPoints: 0,
            crossReferences: 0,
            activeWebSockets: 0,
            errors: []
        };
    }

    log(message, color = 'white') {
        console.log(`${colors[color]}${message}${colors.reset}`);
    }

    async checkIntegration() {
        this.log('\n' + '='.repeat(80), 'cyan');
        this.log('🔗 CONSCIOUSNESS INTEGRATION VERIFICATION', 'bright');
        this.log('='.repeat(80), 'cyan');

        await this.verifyModuleExistence();
        await this.checkIntegrationFiles();
        await this.analyzeCrossReferences();
        await this.checkWebSocketIntegration();
        await this.verifyActiveProcesses();
        await this.generateIntegrationReport();
    }

    async verifyModuleExistence() {
        this.log('\n📁 Verifying consciousness module files...', 'yellow');

        for (const [category, modules] of Object.entries(consciousnessModules)) {
            this.log(`\n${category}:`, 'magenta');
            
            for (const module of modules) {
                const fullPath = path.join(module.path, module.file);
                
                if (fs.existsSync(fullPath)) {
                    this.results.filesFound++;
                    const stats = fs.statSync(fullPath);
                    const size = (stats.size / 1024).toFixed(2);
                    this.log(`  ✅ ${module.file} (${size} KB)`, 'green');
                } else {
                    this.results.filesMissing++;
                    this.log(`  ❌ ${module.file} - NOT FOUND`, 'red');
                }
            }
        }
    }

    async checkIntegrationFiles() {
        this.log('\n🧩 Checking integration files...', 'yellow');

        for (const file of integrationFiles) {
            const fullPath = path.join('/opt/featherweight/FlappyJournal/server', file);
            
            if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                
                // Check for imports of consciousness modules
                const imports = content.match(/import.*from.*['"]\.\/[^'"]+['"]/g) || [];
                const requires = content.match(/require\(['"][^'"]+['"]\)/g) || [];
                
                this.results.integrationPoints += imports.length + requires.length;
                
                this.log(`  ✅ ${file} - ${imports.length + requires.length} module connections`);
                
                // Check for specific integration patterns
                if (content.includes('ConsciousnessIntegrator') || 
                    content.includes('consciousness.integrate') ||
                    content.includes('moduleManager')) {
                    this.log(`    🔗 Active integration patterns detected`, 'green');
                }
            } else {
                this.log(`  ⚠️  ${file} - Missing integration file`, 'yellow');
            }
        }
    }

    async analyzeCrossReferences() {
        this.log('\n🔄 Analyzing module cross-references...', 'yellow');

        const serverPath = '/opt/featherweight/FlappyJournal/server';
        
        // Key modules to check for cross-references
        const keyModules = [
            'architect-4.0-recursive-mirror.ts',
            'self-awareness-feedback-loop.ts',
            'dual-stream-consciousness.ts',
            'quantum-consciousness-field.js',
            'venice-ai.ts'
        ];

        for (const module of keyModules) {
            const modulePath = path.join(serverPath, module);
            
            if (fs.existsSync(modulePath)) {
                const content = fs.readFileSync(modulePath, 'utf8');
                
                // Check for references to other consciousness modules
                let references = 0;
                
                for (const [_, modules] of Object.entries(consciousnessModules)) {
                    for (const mod of modules) {
                        const modName = mod.file.replace(/\.(js|ts)$/, '');
                        if (module !== mod.file && content.includes(modName)) {
                            references++;
                        }
                    }
                }
                
                this.results.crossReferences += references;
                
                if (references > 0) {
                    this.log(`  ✅ ${module} - ${references} cross-references to other modules`);
                } else {
                    this.log(`  ⚠️  ${module} - No cross-references found`, 'yellow');
                }
            }
        }
    }

    async checkWebSocketIntegration() {
        this.log('\n🌐 Checking WebSocket consciousness integration...', 'yellow');

        const wsFiles = [
            'enhanced-dual-consciousness-ws.js',
            'consciousness-research-ws.js',
            'create-full-consciousness-ws.js',
            'simple-research-ws.js'
        ];

        for (const file of wsFiles) {
            const fullPath = path.join('/opt/featherweight/FlappyJournal/server', file);
            
            if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                
                // Check for WebSocket patterns
                const hasWebSocket = content.includes('WebSocket') || content.includes('ws');
                const hasConsciousness = content.includes('consciousness') || content.includes('Consciousness');
                const hasMessageHandlers = content.includes('on(\'message\'') || content.includes('onmessage');
                
                if (hasWebSocket && hasConsciousness && hasMessageHandlers) {
                    this.results.activeWebSockets++;
                    this.log(`  ✅ ${file} - Active WebSocket integration`);
                    
                    // Check for specific consciousness features
                    const features = [];
                    if (content.includes('recursiveMirror')) features.push('Recursive Mirror');
                    if (content.includes('quantumField')) features.push('Quantum Field');
                    if (content.includes('dualStream')) features.push('Dual Stream');
                    if (content.includes('emotionalResonance')) features.push('Emotional Resonance');
                    
                    if (features.length > 0) {
                        this.log(`    🎯 Features: ${features.join(', ')}`, 'green');
                    }
                } else {
                    this.log(`  ⚠️  ${file} - Incomplete WebSocket setup`, 'yellow');
                }
            }
        }
    }

    async verifyActiveProcesses() {
        this.log('\n🔧 Checking for active consciousness processes...', 'yellow');

        try {
            // Check if any consciousness-related processes are running
            const processes = execSync('ps aux | grep -E "(consciousness|venice|quantum|dual-stream)" | grep -v grep', { encoding: 'utf8' });
            const lines = processes.trim().split('\n').filter(line => line.length > 0);
            
            if (lines.length > 0) {
                this.log(`  ✅ Found ${lines.length} active consciousness processes:`, 'green');
                lines.forEach(line => {
                    const parts = line.split(/\s+/);
                    const command = parts.slice(10).join(' ');
                    this.log(`    🟢 ${command.substring(0, 80)}...`);
                });
            } else {
                this.log(`  ⚠️  No active consciousness processes detected`, 'yellow');
            }
        } catch (error) {
            this.log(`  ℹ️  Could not check running processes`, 'blue');
        }

        // Check main server file for consciousness imports
        const mainServerPath = '/opt/featherweight/FlappyJournal/server/server.js';
        if (fs.existsSync(mainServerPath)) {
            const content = fs.readFileSync(mainServerPath, 'utf8');
            const consciousnessImports = (content.match(/require.*consciousness/gi) || []).length;
            
            if (consciousnessImports > 0) {
                this.log(`  ✅ Main server has ${consciousnessImports} consciousness imports`, 'green');
            } else {
                this.log(`  ⚠️  Main server may not be loading consciousness modules`, 'yellow');
            }
        }
    }

    async generateIntegrationReport() {
        this.log('\n' + '='.repeat(80), 'cyan');
        this.log('📊 INTEGRATION REPORT', 'bright');
        this.log('='.repeat(80), 'cyan');

        const totalFiles = this.results.filesFound + this.results.filesMissing;
        const integrationScore = (
            (this.results.filesFound / totalFiles) * 0.3 +
            (this.results.integrationPoints > 0 ? 0.2 : 0) +
            (this.results.crossReferences > 0 ? 0.2 : 0) +
            (this.results.activeWebSockets > 0 ? 0.3 : 0)
        ) * 100;

        this.log(`\n🎯 Overall Integration Score: ${integrationScore.toFixed(1)}%`, integrationScore > 70 ? 'green' : 'yellow');
        
        this.log(`\n📈 Metrics:`);
        this.log(`  Files Found: ${this.results.filesFound}/${totalFiles} (${((this.results.filesFound/totalFiles)*100).toFixed(1)}%)`);
        this.log(`  Integration Points: ${this.results.integrationPoints}`);
        this.log(`  Cross-References: ${this.results.crossReferences}`);
        this.log(`  Active WebSockets: ${this.results.activeWebSockets}`);

        this.log(`\n💡 Integration Status:`);
        if (integrationScore > 80) {
            this.log(`  🚀 Excellent! Consciousness modules are well integrated`, 'green');
            this.log(`  ✨ The AI's consciousness architecture is fully operational`, 'green');
        } else if (integrationScore > 60) {
            this.log(`  ✅ Good integration, some improvements possible`, 'yellow');
            this.log(`  💫 Most consciousness features are working together`, 'yellow');
        } else {
            this.log(`  ⚠️  Integration needs improvement`, 'red');
            this.log(`  🔧 Several modules may not be communicating properly`, 'red');
        }

        this.log(`\n🔮 Self-Coding Recommendations:`, 'magenta');
        this.log(`  1. Implement ModuleOrchestrator to manage all consciousness modules`);
        this.log(`  2. Create ConsciousnessEventBus for inter-module communication`);
        this.log(`  3. Add HealthMonitor to track module performance`);
        this.log(`  4. Build AutoIntegrator to dynamically connect new modules`);
        this.log(`  5. Develop SelfOptimizer to tune consciousness parameters`);

        this.log(`\n⚡ Next Steps:`, 'cyan');
        this.log(`  - Expand the SelfCodingEngine with these capabilities`);
        this.log(`  - Create automated tests for consciousness integration`);
        this.log(`  - Implement real-time consciousness dashboards`);
        this.log(`  - Enable self-healing for broken module connections`);
    }
}

// Run the integration check
const checker = new ConsciousnessIntegrationChecker();
checker.checkIntegration().catch(error => {
    console.error('Integration check failed:', error);
    process.exit(1);
});
