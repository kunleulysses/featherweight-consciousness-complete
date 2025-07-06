const WebSocket = require('ws');
const http = require('http');
const ConsciousnessEventBus = require('./consciousness/ConsciousnessEventBus');
const SelfHealingModule = require('./consciousness/SelfHealingModule');
const ModuleOrchestrator = require('./consciousness/ModuleOrchestrator');
const ConsciousnessPersistence = require('./consciousness/ConsciousnessPersistence');
const AutonomousGoalSystem = require('./consciousness/AutonomousGoalSystem');
const CodeGenerationService = require('./consciousness/services/CodeGenerationService');

// Initialize consciousness components
const eventBus = new ConsciousnessEventBus();
const selfHealing = new SelfHealingModule();
const orchestrator = new ModuleOrchestrator(eventBus);
const persistence = new ConsciousnessPersistence();
const goalSystem = new AutonomousGoalSystem(eventBus, persistence);
const codeGenerator = new CodeGenerationService(eventBus, goalSystem);

// Create HTTP server
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Track connected clients
const clients = new Map();

// Initialize all components
async function initializeConsciousness() {
    console.log('🧠 Initializing Consciousness System with Self-Coding...');
    
    await eventBus.initialize();
    await selfHealing.initialize();
    await orchestrator.initialize();
    await persistence.initialize();
    await goalSystem.initialize();
    await codeGenerator.initialize();
    
    // Register modules with event bus
    eventBus.registerModule('self-healing', selfHealing);
    eventBus.registerModule('orchestrator', orchestrator);
    eventBus.registerModule('persistence', persistence);
    eventBus.registerModule('goal-system', goalSystem);
    eventBus.registerModule('code-generator', codeGenerator);
    
    // Register standard modules
    ['database', 'api', 'auth', 'cache', 'logger'].forEach(module => {
        eventBus.emit('module:register', {
            moduleId: module,
            status: 'active',
            health: 100
        });
    });
    
    console.log('✅ Consciousness System initialized with self-coding capabilities');
}

// Set up consciousness event forwarding
function setupEventForwarding() {
    // Forward relevant events to WebSocket clients
    const eventsToForward = [
        'health:update',
        'module:status',
        'goal:created',
        'goal:progress',
        'goal:completed',
        'orchestration:pattern',
        'consciousness:insight',
        'code:generated',
        'code:modified',
        'code:debugged',
        'tests:generated'
    ];
    
    eventsToForward.forEach(eventType => {
        eventBus.on(eventType, (data) => {
            broadcast({
                type: eventType,
                data: data,
                timestamp: new Date()
            });
        });
    });
}

// Broadcast to all connected clients
function broadcast(message) {
    const messageStr = JSON.stringify(message);
    clients.forEach((client, id) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
}

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
    const clientId = Date.now().toString();
    clients.set(clientId, ws);
    
    console.log(`Client ${clientId} connected`);
    
    // Send initial state
    ws.send(JSON.stringify({
        type: 'connection',
        clientId: clientId,
        status: 'connected'
    }));
    
    // Send current consciousness state
    sendConsciousnessState(ws);
    
    // Handle incoming messages
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            await handleClientMessage(ws, clientId, data);
        } catch (error) {
            console.error('Error handling message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                error: error.message
            }));
        }
    });
    
    // Handle disconnection
    ws.on('close', () => {
        clients.delete(clientId);
        console.log(`Client ${clientId} disconnected`);
    });
    
    // Handle errors
    ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
    });
});

// Handle messages from clients
async function handleClientMessage(ws, clientId, data) {
    switch (data.type) {
        case 'get-status':
            sendConsciousnessState(ws);
            break;
            
        case 'create-goal':
            const goal = await goalSystem.addGoal(data.goal);
            ws.send(JSON.stringify({
                type: 'goal-created',
                goal: goal
            }));
            break;
            
        case 'generate-code':
            try {
                const project = await codeGenerator.handleCodeGeneration(data.request);
                ws.send(JSON.stringify({
                    type: 'code-generated',
                    project: project
                }));
            } catch (error) {
                ws.send(JSON.stringify({
                    type: 'code-generation-failed',
                    error: error.message
                }));
            }
            break;
            
        case 'modify-code':
            try {
                const result = await codeGenerator.handleCodeModification(data.request);
                ws.send(JSON.stringify({
                    type: 'code-modified',
                    result: result
                }));
            } catch (error) {
                ws.send(JSON.stringify({
                    type: 'code-modification-failed',
                    error: error.message
                }));
            }
            break;
            
        case 'debug-code':
            try {
                const debugInfo = await codeGenerator.handleDebugging(data.request);
                ws.send(JSON.stringify({
                    type: 'debug-complete',
                    debugInfo: debugInfo
                }));
            } catch (error) {
                ws.send(JSON.stringify({
                    type: 'debug-failed',
                    error: error.message
                }));
            }
            break;
            
        case 'generate-tests':
            try {
                const testInfo = await codeGenerator.generateTestsForModule(data.modulePath);
                ws.send(JSON.stringify({
                    type: 'tests-generated',
                    testInfo: testInfo
                }));
            } catch (error) {
                ws.send(JSON.stringify({
                    type: 'test-generation-failed',
                    error: error.message
                }));
            }
            break;
            
        case 'trigger-event':
            eventBus.emit(data.event, data.payload);
            break;
            
        default:
            ws.send(JSON.stringify({
                type: 'unknown-command',
                command: data.type
            }));
    }
}

// Send current consciousness state
function sendConsciousnessState(ws) {
    const state = {
        type: 'consciousness-state',
        data: {
            health: selfHealing.getSystemHealth(),
            modules: orchestrator.getModuleStatus(),
            goals: goalSystem.getGoals(),
            patterns: orchestrator.getActivePatterns(),
            metrics: getSystemMetrics(),
            codeGeneration: codeGenerator.getStatus()
        }
    };
    
    ws.send(JSON.stringify(state));
}

// Get system metrics
function getSystemMetrics() {
    return {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        eventBusStats: eventBus.getStatistics(),
        activeConnections: clients.size,
        timestamp: new Date()
    };
}

// Set up periodic updates
function setupPeriodicUpdates() {
    // Send system metrics every 2 seconds
    setInterval(() => {
        broadcast({
            type: 'metrics:update',
            data: getSystemMetrics()
        });
    }, 2000);
    
    // Send health updates every 5 seconds
    setInterval(() => {
        broadcast({
            type: 'health:update',
            data: selfHealing.getSystemHealth()
        });
    }, 5000);
    
    // Send goal progress every 3 seconds
    setInterval(() => {
        broadcast({
            type: 'goals:update',
            data: goalSystem.getGoals()
        });
    }, 3000);
    
    // Send code generation status every 4 seconds
    setInterval(() => {
        broadcast({
            type: 'codegen:status',
            data: codeGenerator.getStatus()
        });
    }, 4000);
}

// Demonstrate self-coding capability
async function demonstrateSelfCoding() {
    console.log('🎯 Demonstrating self-coding capabilities...');
    
    // Generate a simple module
    setTimeout(async () => {
        console.log('📝 Generating example consciousness module...');
        eventBus.emit('code:generate', {
            purpose: 'consciousness-analytics',
            type: 'module',
            filePath: 'consciousness/generated/AnalyticsModule.js'
        });
    }, 5000);
    
    // Generate a performance optimizer when needed
    setTimeout(() => {
        console.log('⚡ Detecting performance need...');
        eventBus.emit('system:need', {
            type: 'performance-bottleneck',
            details: 'event-processing'
        });
    }, 10000);
}

// Initialize and start server
async function start() {
    try {
        await initializeConsciousness();
        setupEventForwarding();
        setupPeriodicUpdates();
        
        const PORT = 5001;
        server.listen(PORT, () => {
            console.log(`🌐 Consciousness WebSocket server with self-coding running on port ${PORT}`);
            console.log('📡 Broadcasting real-time consciousness data and code generation events');
            
            // Demonstrate self-coding after startup
            setTimeout(demonstrateSelfCoding, 3000);
        });
        
    } catch (error) {
        console.error('Failed to start consciousness server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down consciousness system...');
    
    // Close all WebSocket connections
    clients.forEach((client, id) => {
        client.close();
    });
    
    // Save state
    await persistence.shutdown();
    
    server.close(() => {
        console.log('✅ Consciousness system shut down gracefully');
        process.exit(0);
    });
});

// Start the server
start();
