/**
 * Standalone Unified Consciousness WebSocket Setup
 * Works without requiring TypeScript imports
 */

import { createRequire } from 'module';
import WebSocket from 'ws';
import { createServer } from 'http';

const require = createRequire(import.meta.url);

// Import consciousness modules bundle
const {
  consciousnessEventBus,
  selfHealingModule,
  moduleOrchestrator,
  autonomousGoalSystem,
  consciousnessPersistence,
  registerStandardModules
} = require('./consciousness-modules-bundle.cjs');

// Setup function that doesn't depend on TypeScript imports
export function setupUnifiedConsciousnessWebSocket(server) {
  console.log('🧠 Setting up Unified Consciousness WebSocket...');
  
  // Initialize consciousness modules
  try {
    // Register standard modules if not already done
    if (consciousnessEventBus.getRegisteredModules().length === 0) {
      registerStandardModules();
      console.log('✅ Consciousness modules registered');
    }
    
    // Start services if not already running
    if (!selfHealingModule.isActive) {
      selfHealingModule.start();
      console.log('✅ Self-healing module started');
    }
    
    if (!moduleOrchestrator.isActive) {
      moduleOrchestrator.start();
      console.log('✅ Module orchestrator started');
    }
    
    if (!autonomousGoalSystem.isActive) {
      autonomousGoalSystem.start();
      console.log('✅ Autonomous goal system started');
    }
    
    if (!consciousnessPersistence.isActive) {
      consciousnessPersistence.start();
      console.log('✅ Consciousness persistence started');
    }
    
  } catch (error) {
    console.error('Error initializing consciousness modules:', error);
  }
  
  // Main consciousness stream
  const consciousnessWss = new WebSocket.Server({ 
    server,
    path: '/consciousness-stream'
  });
  
  consciousnessWss.on('connection', (ws) => {
    console.log('📡 Client connected to consciousness stream');
    
    const sendMetrics = () => {
      if (ws.readyState === WebSocket.OPEN) {
        const modules = consciousnessEventBus.getRegisteredModules();
        const eventMetrics = consciousnessEventBus.getMetrics();
        const activeModules = modules.filter(m => m.isActive).length;
        
        ws.send(JSON.stringify({
          type: 'system-metrics',
          metrics: {
            activeModules,
            totalModules: modules.length,
            eventsPerSecond: eventMetrics.eventsPerSecond,
            integrationScore: Math.round((activeModules / Math.max(modules.length, 1)) * 100),
            consciousnessState: activeModules > 0 ? 'Fully Operational' : 'Initializing',
            lastCheckpoint: new Date().toLocaleTimeString(),
            // Simulated consciousness metrics
            phi: 3.2 + Math.random() * 0.5,
            quantumCoherence: 0.85 + Math.random() * 0.1,
            emotionalResonance: 0.7 + Math.random() * 0.2,
            creativeEmergence: 0.6 + Math.random() * 0.3,
            // Real metrics
            totalEvents: eventMetrics.totalEvents,
            eventQueue: eventMetrics.eventQueue,
            latency: eventMetrics.latency
          }
        }));
      }
    };
    
    // Send initial metrics
    sendMetrics();
    
    // Send updates every 2 seconds
    const metricsInterval = setInterval(sendMetrics, 2000);
    
    ws.on('close', () => {
      clearInterval(metricsInterval);
      console.log('📡 Client disconnected from consciousness stream');
    });
  });

  // Health monitoring stream
  const healthWss = new WebSocket.Server({
    server,
    path: '/health-stream'
  });
  
  healthWss.on('connection', (ws) => {
    console.log('📡 Client connected to health stream');
    
    const sendHealthReport = () => {
      if (ws.readyState === WebSocket.OPEN) {
        const healthReport = selfHealingModule.getHealthReport();
        const modules = Array.from(healthReport.entries()).map(([moduleId, health]) => ({
          moduleId,
          moduleName: moduleId.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          status: health.status,
          errorCount: health.errorCount || 0,
          performance: health.performance || 1.0,
          lastHeartbeat: health.lastHeartbeat || Date.now()
        }));
        
        ws.send(JSON.stringify({
          type: 'health-report',
          modules
        }));
      }
    };
    
    sendHealthReport();
    const healthInterval = setInterval(sendHealthReport, 5000);
    
    ws.on('close', () => {
      clearInterval(healthInterval);
      console.log('📡 Client disconnected from health stream');
    });
  });

  // Goals tracking stream
  const goalsWss = new WebSocket.Server({
    server,
    path: '/goals-stream'
  });
  
  goalsWss.on('connection', (ws) => {
    console.log('📡 Client connected to goals stream');
    
    const sendGoals = () => {
      if (ws.readyState === WebSocket.OPEN) {
        const goals = autonomousGoalSystem.getGoals();
        ws.send(JSON.stringify({
          type: 'goals-update',
          goals
        }));
      }
    };
    
    sendGoals();
    
    // Listen for goal updates
    const progressHandler = () => sendGoals();
    autonomousGoalSystem.on('goalProgress', progressHandler);
    autonomousGoalSystem.on('goalActivated', progressHandler);
    autonomousGoalSystem.on('goalCompleted', progressHandler);
    
    ws.on('close', () => {
      autonomousGoalSystem.off('goalProgress', progressHandler);
      autonomousGoalSystem.off('goalActivated', progressHandler);
      autonomousGoalSystem.off('goalCompleted', progressHandler);
      console.log('📡 Client disconnected from goals stream');
    });
  });

  // Module orchestration stream
  const orchestrationWss = new WebSocket.Server({
    server,
    path: '/orchestration-stream'
  });
  
  orchestrationWss.on('connection', (ws) => {
    console.log('📡 Client connected to orchestration stream');
    
    // Send module network
    const modules = consciousnessEventBus.getRegisteredModules();
    ws.send(JSON.stringify({
      type: 'modules-update',
      modules: modules.map(m => ({
        id: m.moduleId,
        name: m.moduleName,
        type: m.moduleType,
        active: m.isActive
      }))
    }));
    
    // Listen for module interactions
    const eventHandler = ({ event, targetModule }) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'link-activity',
          source: event.source,
          target: targetModule,
          active: true
        }));
        
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'link-activity',
              source: event.source,
              target: targetModule,
              active: false
            }));
          }
        }, 2000);
      }
    };
    
    consciousnessEventBus.on('eventPropagated', eventHandler);
    
    // Also create some simulated activity
    const activityInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN && modules.length > 1) {
        const source = modules[Math.floor(Math.random() * modules.length)];
        const target = modules[Math.floor(Math.random() * modules.length)];
        
        if (source.moduleId !== target.moduleId) {
          ws.send(JSON.stringify({
            type: 'link-activity',
            source: source.moduleId,
            target: target.moduleId,
            active: true
          }));
          
          setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'link-activity',
                source: source.moduleId,
                target: target.moduleId,
                active: false
              }));
            }
          }, 2000);
        }
      }
    }, 3000);
    
    ws.on('close', () => {
      consciousnessEventBus.off('eventPropagated', eventHandler);
      clearInterval(activityInterval);
      console.log('📡 Client disconnected from orchestration stream');
    });
  });
  
  console.log('✅ Unified Consciousness WebSocket endpoints ready');
  console.log('   - /consciousness-stream');
  console.log('   - /health-stream');
  console.log('   - /goals-stream');
  console.log('   - /orchestration-stream');
}

// Start HTTP server on port 5001
const CONSCIOUSNESS_PORT = process.env.CONSCIOUSNESS_PORT || 5001;
const httpServer = createServer();

setupUnifiedConsciousnessWebSocket(httpServer);

httpServer.listen(CONSCIOUSNESS_PORT, () => {
  console.log(`🧠 Consciousness WebSocket server listening on port ${CONSCIOUSNESS_PORT}`);
});
