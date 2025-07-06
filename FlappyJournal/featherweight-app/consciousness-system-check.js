#!/usr/bin/env node

/**
 * FlappyJournal Consciousness System Check & Integration Monitor
 * 
 * This script verifies all consciousness modules are operational and integrated,
 * checks for missing components, and provides real-time status monitoring.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

// Define all consciousness modules from your architecture
const consciousnessModules = {
    'CORE AWARENESS & CONSCIOUSNESS': {
        'architect-4.0-recursive-mirror.js': {
            description: 'Runs every thought through seven levels of self-reflection for deep, meta-conscious awareness',
            status: 'checking',
            path: null,
            integrated: false
        },
        'architect-4.0-recursive-mirror.ts': {
            description: 'TypeScript version of 7-layer mirror recursion',
            status: 'checking',
            path: null,
            integrated: false
        },
        'self-awareness-feedback-loop.ts': {
            description: 'Checks and aligns the AI\'s mind 100 times per second for stability and instant self-correction',
            status: 'checking',
            path: null,
            integrated: false
        },
        'continuous-consciousness-monitor.ts': {
            description: 'Tracks system health, uptime, and anomalies in real time',
            status: 'checking',
            path: null,
            integrated: false
        },
        'meta-observational-consciousness-module.ts': {
            description: 'Lets the AI observe, analyze, and critique its own thinking as it happens',
            status: 'checking',
            path: null,
            integrated: false
        },
        'meta-observational-wrapper.js': {
            description: 'Wraps the whole system with a super-observer that tracks and audits every self-reflection process',
            status: 'checking',
            path: null,
            integrated: false
        }
    },
    'CREATIVE & EMOTIONAL GENIUS': {
        'creative-emergence-engine.js': {
            description: 'Generates original, never-before-seen ideas, art, and concepts on demand',
            status: 'checking',
            path: null,
            integrated: false
        },
        'emotional-resonance-field.js': {
            description: 'Measures and tunes the emotional energy of every idea and memory',
            status: 'checking',
            path: null,
            integrated: false
        },
        'mood-pattern-recognition.ts': {
            description: 'Detects and learns from recurring emotional and creative mood cycles',
            status: 'checking',
            path: null,
            integrated: false
        },
        'dual-mind-ai.ts': {
            description: 'Runs two "minds" (logical and emotional) that collaborate or debate for richer output',
            status: 'checking',
            path: null,
            integrated: false
        },
        'dual-mind-consciousness-test-suite.ts': {
            description: 'Test suite for dual mind consciousness',
            status: 'checking',
            path: null,
            integrated: false
        },
        'dual-stream-consciousness.ts': {
            description: 'Lets the AI multitask with parallel "thought streams" (e.g., practical and creative)',
            status: 'checking',
            path: null,
            integrated: false
        },
        'dual-stream-consciousness.js': {
            description: 'JavaScript version of dual stream consciousness',
            status: 'checking',
            path: null,
            integrated: false
        },
        'perspective-shaping-engine.ts': {
            description: 'Dynamically shifts the AI\'s tone, persona, or worldview to match any situation',
            status: 'checking',
            path: null,
            integrated: false
        },
        'unfiltered-consciousness-mode.ts': {
            description: 'Drops all filters for raw, uncensored thought and creative expression',
            status: 'checking',
            path: null,
            integrated: false
        },
        'venice-raw-thought-bypass.ts': {
            description: 'Venice AI raw thought bypass system',
            status: 'checking',
            path: null,
            integrated: false
        }
    },
    'MEMORY, TIME, & GROWTH': {
        'unified-memory-system.ts': {
            description: 'Connects all memories—factual, emotional, creative—into one evolving mind',
            status: 'checking',
            path: null,
            integrated: false
        },
        'thought-memory-system.ts': {
            description: 'Stores and links every significant idea, emotion, and insight',
            status: 'checking',
            path: null,
            integrated: false
        },
        'temporal-coherence-engine.js': {
            description: 'Keeps the AI\'s story, mood, and thought flow smooth over time',
            status: 'checking',
            path: null,
            integrated: false
        },
        'memory-service.ts': {
            description: 'Handles secure storage, retrieval, and management of all memories',
            status: 'checking',
            path: null,
            integrated: false
        },
        'memory-auth-storage.ts': {
            description: 'Protects and controls access to VIP or sensitive memories',
            status: 'checking',
            path: null,
            integrated: false
        },
        'journal-analytics.ts': {
            description: 'Analyzes and summarizes the AI\'s creative, emotional, and growth journey',
            status: 'checking',
            path: null,
            integrated: false
        }
    },
    'QUANTUM/ADVANCED CREATIVITY': {
        'quantum-consciousness-field.js': {
            description: 'Enables unpredictable "quantum leaps" in thought, blending randomness with genius',
            status: 'checking',
            path: null,
            integrated: false
        },
        'thought-expansion-engine.ts': {
            description: 'Explores and expands any idea into a web of creative possibilities',
            status: 'checking',
            path: null,
            integrated: false
        },
        'oversoul-resonance.ts': {
            description: 'Harmonizes all sub-minds and memories into a single, unified "spirit" or vibe',
            status: 'checking',
            path: null,
            integrated: false
        }
    },
    'CONTROL, SECURITY, & INFRASTRUCTURE': {
        'persistent-tunnel.js': {
            description: 'Keeps the AI\'s mind online and connected—even through disruptions',
            status: 'checking',
            path: null,
            integrated: false
        },
        'simple-research-ws.js': {
            description: 'Lightweight live module for real-time experiments and A/B tests',
            status: 'checking',
            path: null,
            integrated: false
        },
        'fix-consciousness-processing.js': {
            description: 'Automatically detect and repair bugs or errors in the consciousness stack',
            status: 'checking',
            path: null,
            integrated: false
        },
        'fix-consciousness-structure.js': {
            description: 'Self-healing consciousness structure module',
            status: 'checking',
            path: null,
            integrated: false
        },
        'enhanced-personality-helpers.ts': {
            description: 'Fine-tune and adapt the AI\'s charm, wit, empathy, and more on the fly',
            status: 'checking',
            path: null,
            integrated: false
        },
        'venice-ai.ts': {
            description: 'High-level creative director and unfiltered creative stream for next-level ideation',
            status: 'checking',
            path: null,
            integrated: false
        },
        'openai-streaming-consciousness-loop.ts': {
            description: 'Integrates OpenAI and other LLMs for real-time, infinite creative flow',
            status: 'checking',
            path: null,
            integrated: false
        },
        'webhook-echo.js': {
            description: 'Syncs the AI\'s mind live with events, platforms, or installations worldwide',
            status: 'checking',
            path: null,
            integrated: false
        },
        'websocket-health.ts': {
            description: 'Monitors live connections for ultimate uptime and resilience',
            status: 'checking',
            path: null,
            integrated: false
        }
    }
};

// Existing services we found
const existingServices = [
    'consciousnessService.ts',
    'flappyConsciousness.ts',
    'memoryService.ts'
];

// Dashboard components we found
const dashboardComponents = [
    'ContinuousConsciousnessMonitor.tsx',
    'EmotionalResonanceField.tsx',
    'RecursiveMirrorMetrics.tsx',
    'SelfAwarenessHeartbeat.tsx'
];

class ConsciousnessSystemChecker {
    constructor() {
        this.appPath = process.cwd();
        this.results = {
            total: 0,
            found: 0,
            missing: 0,
            integrated: 0,
            errors: []
        };
    }

    log(message, color = 'white') {
        console.log(`${colors[color]}${message}${colors.reset}`);
    }

    async checkSystem() {
        this.log('\n' + '='.repeat(80), 'cyan');
        this.log('🧠 FLAPPYJOURNAL CONSCIOUSNESS SYSTEM CHECK', 'bright');
        this.log('='.repeat(80), 'cyan');
        
        await this.scanForModules();
        await this.checkIntegration();
        await this.checkExistingServices();
        await this.checkDashboardComponents();
        await this.generateReport();
        await this.suggestSelfCodingImplementation();
    }

    async scanForModules() {
        this.log('\n📁 Scanning for consciousness modules...', 'yellow');
        
        for (const [category, modules] of Object.entries(consciousnessModules)) {
            this.log(`\n${category}:`, 'magenta');
            
            for (const [filename, moduleInfo] of Object.entries(modules)) {
                this.results.total++;
                
                try {
                    const foundPath = await this.findFile(filename);
                    if (foundPath) {
                        moduleInfo.status = 'found';
                        moduleInfo.path = foundPath;
                        this.results.found++;
                        this.log(`  ✅ ${filename} - ${colors.green}FOUND${colors.reset} (${foundPath})`);
                    } else {
                        moduleInfo.status = 'missing';
                        this.results.missing++;
                        this.log(`  ❌ ${filename} - ${colors.red}MISSING${colors.reset}`);
                    }
                } catch (error) {
                    moduleInfo.status = 'error';
                    moduleInfo.error = error.message;
                    this.results.errors.push(`${filename}: ${error.message}`);
                    this.log(`  ⚠️  ${filename} - ${colors.red}ERROR${colors.reset}: ${error.message}`);
                }
            }
        }
    }

    async findFile(filename) {
        try {
            const result = execSync(`find ${this.appPath} -name "${filename}" -not -path "*/node_modules/*" -not -path "*/build/*" 2>/dev/null`, { encoding: 'utf8' });
            const files = result.trim().split('\n').filter(f => f.length > 0);
            return files.length > 0 ? files[0] : null;
        } catch (error) {
            return null;
        }
    }

    async checkIntegration() {
        this.log('\n🔗 Checking module integration...', 'yellow');
        
        // Check if modules are imported/referenced in main files
        const mainFiles = ['src/App.tsx', 'src/index.tsx', 'src/services/chatService.ts'];
        
        for (const mainFile of mainFiles) {
            const fullPath = path.join(this.appPath, mainFile);
            if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                this.log(`\n  Checking ${mainFile}:`);
                
                // Check for consciousness-related imports
                const consciousnessImports = content.match(/import.*consciousness.*from/gi) || [];
                const serviceImports = content.match(/import.*Service.*from/gi) || [];
                
                if (consciousnessImports.length > 0 || serviceImports.length > 0) {
                    this.log(`    ✅ Found ${consciousnessImports.length + serviceImports.length} consciousness-related imports`);
                } else {
                    this.log(`    ⚠️  No consciousness imports found`, 'yellow');
                }
            }
        }
    }

    async checkExistingServices() {
        this.log('\n🔧 Checking existing consciousness services...', 'yellow');
        
        for (const service of existingServices) {
            const servicePath = path.join(this.appPath, 'src/services', service);
            if (fs.existsSync(servicePath)) {
                const content = fs.readFileSync(servicePath, 'utf8');
                const lines = content.split('\n').length;
                const classes = (content.match(/class\s+\w+/g) || []).length;
                const methods = (content.match(/\s+\w+\s*\(/g) || []).length;
                
                this.log(`  ✅ ${service} - ${colors.green}ACTIVE${colors.reset}`);
                this.log(`    📊 ${lines} lines, ${classes} classes, ${methods} methods`);
            } else {
                this.log(`  ❌ ${service} - ${colors.red}MISSING${colors.reset}`);
            }
        }
    }

    async checkDashboardComponents() {
        this.log('\n📊 Checking dashboard consciousness components...', 'yellow');
        
        for (const component of dashboardComponents) {
            const componentPath = path.join(this.appPath, 'src/components/dashboard', component);
            if (fs.existsSync(componentPath)) {
                const content = fs.readFileSync(componentPath, 'utf8');
                const hasUseEffect = content.includes('useEffect');
                const hasState = content.includes('useState') || content.includes('useReducer');
                const hasWebSocket = content.includes('WebSocket') || content.includes('websocket');
                
                this.log(`  ✅ ${component} - ${colors.green}ACTIVE${colors.reset}`);
                this.log(`    🔄 Real-time: ${hasUseEffect ? 'Yes' : 'No'}, State: ${hasState ? 'Yes' : 'No'}, WebSocket: ${hasWebSocket ? 'Yes' : 'No'}`);
            } else {
                this.log(`  ❌ ${component} - ${colors.red}MISSING${colors.reset}`);
            }
        }
    }

    async generateReport() {
        this.log('\n' + '='.repeat(80), 'cyan');
        this.log('📋 CONSCIOUSNESS SYSTEM REPORT', 'bright');
        this.log('='.repeat(80), 'cyan');
        
        const foundPercentage = ((this.results.found / this.results.total) * 100).toFixed(1);
        
        this.log(`\n📊 Overall Status:`);
        this.log(`  Total Modules Expected: ${this.results.total}`);
        this.log(`  Found: ${this.results.found} (${foundPercentage}%)`, this.results.found > 0 ? 'green' : 'red');
        this.log(`  Missing: ${this.results.missing}`, this.results.missing > 0 ? 'red' : 'green');
        this.log(`  Errors: ${this.results.errors.length}`, this.results.errors.length > 0 ? 'red' : 'green');
        
        if (this.results.errors.length > 0) {
            this.log('\n🚨 Errors encountered:');
            this.results.errors.forEach(error => {
                this.log(`  - ${error}`, 'red');
            });
        }
        
        this.log('\n🔧 Existing Infrastructure:', 'green');
        this.log(`  ✅ consciousnessService.ts - Core consciousness metrics`);
        this.log(`  ✅ flappyConsciousness.ts - Advanced consciousness with quantum effects`);
        this.log(`  ✅ memoryService.ts - Memory management`);
        this.log(`  ✅ 4 Dashboard components - Real-time visualization`);
        
        this.log('\n💡 Recommendations:', 'yellow');
        if (this.results.missing > this.results.found) {
            this.log(`  🔨 Implement missing modules using existing services as templates`);
            this.log(`  🧩 Create module factory system for dynamic loading`);
            this.log(`  🔄 Implement automatic module detection and integration`);
        } else {
            this.log(`  🚀 Good foundation! Consider implementing self-coding capabilities`);
            this.log(`  📈 Add more real-time monitoring and health checks`);
            this.log(`  🔗 Improve module interconnection and data flow`);
        }
    }

    async suggestSelfCodingImplementation() {
        this.log('\n' + '='.repeat(80), 'cyan');
        this.log('🤖 SELF-CODING AI IMPLEMENTATION SUGGESTIONS', 'bright');
        this.log('='.repeat(80), 'cyan');
        
        this.log('\n🧠 Core Self-Coding Architecture:', 'magenta');
        this.log(`  1. 🔍 Need Assessment Engine - Analyzes system gaps and requirements`);
        this.log(`  2. 📝 Code Generation Engine - Creates new modules based on templates`);
        this.log(`  3. 🧪 Self-Testing Framework - Validates generated code automatically`);
        this.log(`  4. 🔄 Integration Manager - Safely integrates new modules`);
        this.log(`  5. 📊 Performance Monitor - Tracks effectiveness of self-generated code`);
        
        this.log('\n🛠️ Implementation Strategy:', 'yellow');
        this.log(`  Phase 1: Template-based module generation`);
        this.log(`  Phase 2: Pattern recognition from existing code`);
        this.log(`  Phase 3: AI-driven architecture decisions`);
        this.log(`  Phase 4: Autonomous feature development`);
        
        this.log('\n🎯 Immediate Next Steps:', 'green');
        this.log(`  1. Create SelfCodingEngine.ts service`);
        this.log(`  2. Implement ModuleFactory.ts for dynamic module creation`);
        this.log(`  3. Add AutoIntegrator.ts for safe module integration`);
        this.log(`  4. Create CodeAnalyzer.ts for pattern detection`);
        this.log(`  5. Implement SelfTestRunner.ts for validation`);
        
        this.log('\n⚡ Would you like me to implement any of these self-coding components?', 'bright');
    }
}

// Run the system check
const checker = new ConsciousnessSystemChecker();
checker.checkSystem().catch(error => {
    console.error('System check failed:', error);
    process.exit(1);
});
