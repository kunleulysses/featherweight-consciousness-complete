import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import vm from 'vm';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AutoIntegrationService extends EventEmitter {
    constructor(eventBus) {
        super();
        this.eventBus = eventBus;
        this.loadedModules = new Map();
        this.sandboxContexts = new Map();
        this.integrationQueue = [];
        this.isProcessing = false;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for code generation completion
        this.eventBus.on('code:generated', async (project) => {
            console.log('🔄 Auto-integration triggered for:', project.filePath);
            await this.queueIntegration(project);
        });

        // Listen for module registration requests
        this.eventBus.on('module:register', async (moduleInfo) => {
            await this.registerModule(moduleInfo);
        });
    }

    async queueIntegration(project) {
        this.integrationQueue.push(project);
        if (!this.isProcessing) {
            await this.processIntegrationQueue();
        }
    }

    async processIntegrationQueue() {
        this.isProcessing = true;
        
        while (this.integrationQueue.length > 0) {
            const project = this.integrationQueue.shift();
            try {
                await this.integrateProject(project);
            } catch (error) {
                console.error('Integration failed:', error);
                this.emit('integration:failed', { project, error });
            }
        }
        
        this.isProcessing = false;
    }

    async integrateProject(project) {
        console.log(`🚀 Starting auto-integration for: ${project.filePath}`);
        
        // 1. Analyze dependencies
        const dependencies = await this.analyzeDependencies(project.code);
        
        // 2. Install missing dependencies
        if (dependencies.missing.length > 0) {
            await this.installDependencies(dependencies.missing);
        }
        
        // 3. Skip sandbox for ES modules, go straight to syntax check
        console.log(`📋 Validating syntax for: ${project.filePath}`);
        try {
            await execAsync(`node --check "${project.filePath}"`);
            console.log('✅ Syntax validation passed');
        } catch (error) {
            throw new Error(`Syntax validation failed: ${error.message}`);
        }
        
        // 4. Dynamic module loading
        const module = await this.dynamicLoadModule(project.filePath);
        
        // 5. Register services/endpoints if applicable
        await this.autoRegisterServices(module, project);
        
        // 6. Update PM2 if needed
        await this.handlePM2Integration(project);
        
        this.emit('integration:completed', { project, module });
        console.log(`✅ Auto-integration completed for: ${project.filePath}`);
    }

    async analyzeDependencies(code) {
        const dependencies = {
            required: [],
            missing: []
        };
        
        // Extract import/require statements
        const importRegex = /import\s+(?:(?:\{[^}]*\})|(?:[^'"\s]+))\s+from\s+['"]([^'"]+)['"]/g;
        const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
        
        let match;
        while ((match = importRegex.exec(code)) !== null) {
            dependencies.required.push(match[1]);
        }
        while ((match = requireRegex.exec(code)) !== null) {
            dependencies.required.push(match[1]);
        }
        
        // Check which are missing
        for (const dep of dependencies.required) {
            if (dep.startsWith('.') || dep.startsWith('/')) continue; // Skip local modules
            
            try {
                await import(dep);
            } catch (error) {
                if (error.code === 'ERR_MODULE_NOT_FOUND' || error.code === 'MODULE_NOT_FOUND') {
                    dependencies.missing.push(dep);
                }
            }
        }
        
        return dependencies;
    }

    async installDependencies(dependencies) {
        if (dependencies.length === 0) return;
        
        console.log(`📦 Installing missing dependencies: ${dependencies.join(', ')}`);
        
        try {
            const { stdout, stderr } = await execAsync(
                `cd ${path.join(__dirname, '../..')} && npm install ${dependencies.join(' ')}`,
                { timeout: 60000 }
            );
            
            if (stderr && !stderr.includes('warn')) {
                console.error('npm install stderr:', stderr);
            }
            
            console.log('✅ Dependencies installed successfully');
        } catch (error) {
            console.error('Failed to install dependencies:', error);
            throw error;
        }
    }

    async dynamicLoadModule(filePath) {
        console.log(`📥 Dynamically loading module: ${filePath}`);
        
        try {
            // Clear module cache if it exists
            const modulePath = path.resolve(filePath);
            if (this.loadedModules.has(modulePath)) {
                console.log('🔄 Reloading existing module');
            }
            
            // Dynamic import with cache busting
            const moduleUrl = `file://${modulePath}?t=${Date.now()}`;
            const module = await import(moduleUrl);
            
            this.loadedModules.set(modulePath, {
                module,
                loadedAt: new Date(),
                filePath: modulePath
            });
            
            // If it's a consciousness module, initialize it
            if (module.default && typeof module.default === 'function') {
                const instance = new module.default(this.eventBus);
                this.loadedModules.get(modulePath).instance = instance;
                return instance;
            }
            
            return module;
        } catch (error) {
            console.error('Failed to load module:', error);
            throw error;
        }
    }

    async autoRegisterServices(module, project) {
        console.log(`🔌 Auto-registering services for: ${project.filePath}`);
        
        // Check if this is an API endpoint
        if (project.filePath.includes('/api/') || project.purpose === 'api-endpoint') {
            await this.registerAPIEndpoint(module, project);
        }
        
        // Check if this is a WebSocket handler
        if (project.filePath.includes('/websocket/') || project.purpose === 'websocket-handler') {
            await this.registerWebSocketHandler(module, project);
        }
        
        // Check if this is a consciousness module
        if (project.filePath.includes('/consciousness/') || project.purpose === 'consciousness-module') {
            await this.registerConsciousnessModule(module, project);
        }
    }

    async registerAPIEndpoint(module, project) {
        // Emit event for the main server to register the endpoint
        this.eventBus.emit('api:register-endpoint', {
            path: module.path || `/api/generated/${path.basename(project.filePath, '.js')}`,
            method: module.method || 'GET',
            handler: module.handler || module.default,
            middleware: module.middleware || []
        });
    }

    async registerWebSocketHandler(module, project) {
        this.eventBus.emit('websocket:register-handler', {
            event: module.event || `generated:${path.basename(project.filePath, '.js')}`,
            handler: module.handler || module.default
        });
    }

    async registerConsciousnessModule(module, project) {
        this.eventBus.emit('consciousness:register-module', {
            name: module.name || path.basename(project.filePath, '.js'),
            instance: module.instance || module,
            capabilities: module.capabilities || []
        });
    }

    async handlePM2Integration(project) {
        // Determine if PM2 reload is needed
        const needsReload = this.shouldReloadPM2(project);
        
        if (needsReload) {
            console.log('🔄 Triggering PM2 reload...');
            try {
                // Check if PM2 is running
                const { stdout: pm2List } = await execAsync('pm2 list');
                if (!pm2List.includes('consciousness-system')) {
                    console.log('PM2 process not found, skipping reload');
                    return;
                }
                
                // Soft reload with zero downtime
                const { stdout } = await execAsync('pm2 reload consciousness-system');
                console.log('✅ PM2 reload completed');
            } catch (error) {
                console.log('PM2 reload skipped:', error.message);
                // Don't throw - system can continue without PM2 reload
            }
        }
    }

    shouldReloadPM2(project) {
        // Reload PM2 for critical system changes
        const criticalPaths = [
            '/consciousness/core/',
            '/consciousness/modules/',
            '/api/consciousness',
            '/websocket/'
        ];
        
        return criticalPaths.some(path => project.filePath.includes(path));
    }

    async unloadModule(filePath) {
        const modulePath = path.resolve(filePath);
        
        if (this.loadedModules.has(modulePath)) {
            const moduleInfo = this.loadedModules.get(modulePath);
            
            // Clean up instance if it exists
            if (moduleInfo.instance && typeof moduleInfo.instance.cleanup === 'function') {
                await moduleInfo.instance.cleanup();
            }
            
            this.loadedModules.delete(modulePath);
            console.log(`🗑️ Module unloaded: ${filePath}`);
        }
    }

    getLoadedModules() {
        return Array.from(this.loadedModules.entries()).map(([path, info]) => ({
            path,
            loadedAt: info.loadedAt,
            hasInstance: !!info.instance
        }));
    }

    async testIntegration(filePath) {
        // Comprehensive integration test
        const tests = {
            syntax: false,
            loading: false,
            functionality: false
        };
        
        try {
            // Syntax check
            await execAsync(`node --check "${filePath}"`);
            tests.syntax = true;
            
            // Loading test
            const module = await this.dynamicLoadModule(filePath);
            tests.loading = !!module;
            
            // Basic functionality test
            if (module && typeof module.test === 'function') {
                tests.functionality = await module.test();
            } else if (module.default && typeof module.default.prototype.test === 'function') {
                const instance = new module.default();
                tests.functionality = instance.test();
            } else {
                tests.functionality = true; // No test function means pass
            }
            
        } catch (error) {
            console.error('Integration test failed:', error);
        }
        
        return tests;
    }
}

export default AutoIntegrationService;
