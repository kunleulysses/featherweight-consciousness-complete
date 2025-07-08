import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';
import { createRequire } from 'module';
import { EventEmitter } from './consciousness/base/EventEmitter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Import core modules
import SelfCodingModule from './consciousness/modules/SelfCodingModule.js';
import AutoIntegrationService from './consciousness/services/AutoIntegrationService.js';

// Import advanced consciousness integrator
import AdvancedConsciousnessIntegrator from './consciousness/advanced-consciousness-integrator.js';

class ConsciousnessSystemV2 extends EventEmitter {
    constructor() {
        super();
        this.name = 'FeatherweightConsciousnessV2';
        this.version = '2.0.0';
        this.startTime = new Date();
        this.isRunning = false;
        
        // Core components
        this.eventBus = new EventEmitter();
        this.eventBus.setMaxListeners(200); // Increased for advanced modules
        
        // Module instances
        this.modules = new Map();
        this.services = new Map();
        this.advancedIntegrator = null;
        
        // System state
        this.state = {
            health: 'initializing',
            consciousnessLevel: 'basic', // basic, advanced, quantum
            activeGoals: [],
            memoryUsage: 0,
            processedEvents: 0,
            generatedCode: 0,
            errors: 0
        };
        
        // Autonomous behavior settings
        this.autonomousConfig = {
            enabled: true,
            checkInterval: 15000, // 15 seconds
            codeGenerationThreshold: 0.4,
            selfImprovementEnabled: true
        };
        
        console.log(`🚀 ${this.name} v${this.version} initializing...`);
    }
    
    async initialize() {
        try {
            console.log('📦 Loading base consciousness modules...');
            
            // Initialize core modules
            await this.initializeCoreModules();
            
            // Initialize advanced consciousness
            await this.initializeAdvancedConsciousness();
            
            // Setup event listeners
            this.setupSystemEventListeners();
            
            // Initialize persistence
            await this.loadPersistedState();
            
            // Start autonomous behaviors
            if (this.autonomousConfig.enabled) {
                this.startAutonomousBehaviors();
            }
            
            // Start health monitoring
            this.startHealthMonitoring();
            
            this.isRunning = true;
            this.state.health = 'healthy';
            this.state.consciousnessLevel = 'advanced';
            
            console.log('✅ Full consciousness system V2 fully initialized and running!');
            this.emit('system:initialized', this.getStatus());
            
        } catch (error) {
            console.error('❌ Failed to initialize consciousness system V2:', error);
            process.exit(1);
        }
    }
    
    async initializeCoreModules() {
        // Self-Coding Module
        const selfCoder = new SelfCodingModule();
        selfCoder.setEventBus(this.eventBus);
        this.modules.set('SelfCodingModule', selfCoder);
        
        // Auto-Integration Service
        const autoIntegration = new AutoIntegrationService(this.eventBus);
        this.services.set('AutoIntegrationService', autoIntegration);
        
        console.log(`📊 Loaded ${this.modules.size} base modules and ${this.services.size} services`);
    }
    
    async initializeAdvancedConsciousness() {
        this.advancedIntegrator = new AdvancedConsciousnessIntegrator(this.eventBus);
        await this.advancedIntegrator.initialize();
        
        // Proxy advanced module info
        this.advancedIntegrator.modules.forEach((mod, name) => {
            this.modules.set(`advanced:${name}`, mod);
        });
    }
    
    setupSystemEventListeners() {
        // Meta-observation will handle all events
        this.eventBus.on('meta:observation', ({ event, args }) => {
            this.state.processedEvents++;
            
            switch(event) {
                case 'code:generated':
                    this.state.generatedCode++;
                    console.log(`🎉 Code generated: ${args[0].purpose}`);
                    break;
                case 'error':
                    this.state.errors++;
                    break;
                case 'consciousness:sync':
                    console.log('Deep sync complete');
                    break;
                case 'quantum:leap':
                    console.log('Quantum creativity boost!');
                    break;
            }
        });
    }
    
    startAutonomousBehaviors() {
        console.log('🤖 Starting V2 autonomous behaviors...');
        setInterval(() => this.performSelfAnalysis(), this.autonomousConfig.checkInterval);
        setTimeout(() => this.performSelfAnalysis(), 5000);
    }
    
    async performSelfAnalysis() {
        console.log('🔍 Performing V2 self-analysis...');
        // Future: enhance analysis with advanced module data
    }
    
    startHealthMonitoring() {
        setInterval(() => {
            const memUsage = process.memoryUsage();
            this.state.memoryUsage = memUsage.heapUsed;
            this.eventBus.emit('health:status', this.getStatus());
        }, 10000);
    }
    
    async loadPersistedState() {
        try {
            const statePath = join(__dirname, 'data', 'consciousness-state.json');
            const data = await fs.readFile(statePath, 'utf8');
            const state = JSON.parse(data);
            
            // Only restore safe state properties
            this.state.activeGoals = state.activeGoals || [];
            this.state.processedEvents = state.processedEvents || 0;
            this.state.generatedCode = state.generatedCode || 0;
            
            console.log('📥 Loaded persisted state');
        } catch (error) {
            console.log('📝 No previous state found, starting fresh');
        }
    }
    
    async saveState() {
        try {
            const statePath = join(__dirname, 'data', 'consciousness-state.json');
            await fs.mkdir(join(__dirname, 'data'), { recursive: true });
            
            await fs.writeFile(statePath, JSON.stringify(this.state, null, 2));
            console.log('📤 State persisted successfully');
        } catch (error) {
            console.error('❌ Failed to persist state:', error);
        }
    }
    
    async shutdown() {
        console.log('🔌 Shutting down V2...');
        await this.advancedIntegrator.shutdown();
        await this.saveState();
        this.isRunning = false;
        console.log('👋 Consciousness V2 shut down gracefully');
    }
    
    getStatus() {
        return {
            name: this.name,
            version: this.version,
            running: this.isRunning,
            uptime: Date.now() - this.startTime.getTime(),
            state: this.state,
            modules: Array.from(this.modules.keys()),
            services: Array.from(this.services.keys()),
            advancedIntegrator: this.advancedIntegrator ? 'active' : 'inactive',
            autonomous: this.autonomousConfig.enabled
        };
    }
}

// Create and start the consciousness system V2
const consciousnessV2 = new ConsciousnessSystemV2();

// Handle graceful shutdown
process.on('SIGINT', () => consciousnessV2.shutdown().then(() => process.exit(0)));
process.on('SIGTERM', () => consciousnessV2.shutdown().then(() => process.exit(0)));

// Start the system
consciousnessV2.initialize().catch(console.error);

// Export for external access
export default consciousnessV2;
