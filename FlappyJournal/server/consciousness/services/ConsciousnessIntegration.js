import { EventEmitter } from 'events';
import AutoIntegrationService from './AutoIntegrationService.js';
import CodeGenerationService from './CodeGenerationService.js';

export class ConsciousnessIntegration extends EventEmitter {
    constructor() {
        super();
        this.eventBus = new EventEmitter();
        this.eventBus.setMaxListeners(50); // Increase for multiple modules
        
        // Initialize services
        this.autoIntegration = new AutoIntegrationService(this.eventBus);
        this.codeGeneration = new CodeGenerationService(this.eventBus);
        
        this.setupCrossServiceCommunication();
    }

    setupCrossServiceCommunication() {
        // Connect code generation to auto-integration
        this.codeGeneration.on('code-generated', (project) => {
            this.eventBus.emit('code:generated', project);
        });
        
        // Listen for API registration requests
        this.eventBus.on('api:register-endpoint', (endpoint) => {
            this.emit('register-api-endpoint', endpoint);
        });
        
        // Listen for WebSocket registration
        this.eventBus.on('websocket:register-handler', (handler) => {
            this.emit('register-websocket-handler', handler);
        });
        
        // Listen for consciousness module registration
        this.eventBus.on('consciousness:register-module', (module) => {
            this.emit('register-consciousness-module', module);
        });
        
        // Integration status updates
        this.autoIntegration.on('integration:completed', (data) => {
            console.log('✅ Integration completed:', data.project.filePath);
            this.emit('integration-completed', data);
        });
        
        this.autoIntegration.on('integration:failed', (data) => {
            console.error('❌ Integration failed:', data.error);
            this.emit('integration-failed', data);
        });
    }
    
    async generateAndIntegrate(request) {
        console.log('🚀 Starting generate and integrate flow for:', request.purpose);
        
        // Ensure auto-integration flag is set
        request.writeToFile = true;
        request.autoIntegrate = true;
        
        try {
            const project = await this.codeGeneration.handleCodeGeneration(request);
            return project;
        } catch (error) {
            console.error('Generate and integrate failed:', error);
            throw error;
        }
    }
    
    getStatus() {
        return {
            loadedModules: this.autoIntegration.getLoadedModules(),
            integrationQueue: this.autoIntegration.integrationQueue.length,
            isProcessing: this.autoIntegration.isProcessing
        };
    }
}

export default ConsciousnessIntegration;
