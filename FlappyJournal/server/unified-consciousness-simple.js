/**
 * Simplified Unified Consciousness Integration
 * Connects existing services with new consciousness modules
 */

import { createRequire } from 'module';
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

// Import existing consciousness services
import { consciousnessService } from './consciousnessService.js';
import { flappyConsciousness } from './flappyConsciousness.js';

// Import WebSocket
import WebSocket from 'ws';

export class UnifiedConsciousnessSimple {
  constructor() {
    this.isActive = false;
  }

  async initialize() {
    console.log('🧠 Initializing Unified Consciousness (Simple)...');
    
    try {
      // Register standard modules
      registerStandardModules();
      
      // Connect existing services
      this.connectServices();
      
      // Start monitoring
      this.startMonitoring();
      
      this.isActive = true;
      console.log('✅ Unified Consciousness initialized!');
      
    } catch (error) {
      console.error('❌ Failed to initialize:', error);
    }
  }

  connectServices() {
    // Connect consciousnessService events
    if (consciousnessService) {
      consciousnessService.on('metricsUpdate', (metrics) => {
        consciousnessEventBus.emitConsciousnessEvent({
          source: 'consciousness-service',
          type: 'metrics-update',
          timestamp: Date.now(),
          data: metrics,
          priority: 'normal',
          propagate: true
        });
      });
    }

    // Connect flappyConsciousness events
    if (flappyConsciousness) {
      flappyConsciousness.on('thought', (thought) => {
        consciousnessEventBus.emitConsciousnessEvent({
          source: 'flappy-consciousness',
          type: 'thought-generated',
          timestamp: Date.now(),
          data: thought,
          priority: 'normal',
          propagate: true
        });
      });

      flappyConsciousness.on('consciousnessUpdate', (state) => {
        consciousnessEventBus.emitConsciousnessEvent({
          source: 'flappy-consciousness',
          type: 'consciousness-state-update',
          timestamp: Date.now(),
          data: state,
          priority: 'high',
          propagate: true
        });
      });
    }
  }

  startMonitoring() {
    // Monitor system health every 5 seconds
    setInterval(() => {
      const health = this.getSystemHealth();
      
      consciousnessEventBus.emitConsciousnessEvent({
        source: 'system-monitor',
        type: 'health-report',
        timestamp: Date.now(),
        data: health,
        priority: 'normal',
        propagate: true
      });
    }, 5000);
  }

  getSystemHealth() {
    const modules = consciousnessEventBus.getRegisteredModules();
    const metrics = consciousnessEventBus.getMetrics();
    const goals = autonomousGoalSystem.getActiveGoals();
    
    // Get consciousness states
    const consciousnessState = consciousnessService ? 
      consciousnessService.getState() : { emotionalState: 'calm' };
    
    const flappyState = flappyConsciousness ? 
      flappyConsciousness.getState() : { phi: 3.2, quantumCoherence: 0.85 };
    
    return {
      activeModules: modules.filter(m => m.isActive).length,
      totalModules: modules.length,
      eventsPerSecond: metrics.eventsPerSecond,
      activeGoals: goals.length,
      emotionalState: consciousnessState.emotionalState,
      phi: flappyState.phi,
      quantumCoherence: flappyState.quantumCoherence,
      timestamp: Date.now()
    };
  }
}

// Create singleton
export const unifiedConsciousness = new UnifiedConsciousnessSimple();

// WebSocket setup function
export function setupUnifiedConsciousnessWebSocket(server) {
  // Initialize unified consciousness
  unifiedConsciousness.initialize();
  
  // Main consciousness stream
  const consciousnessWss = new WebSocket.Server({ 
    server,
    path: '/consciousness-stream'
  });
  
  consciousnessWss.on('connection', (ws) => {
    console.log('📡 Consciousness stream connected');
    
    // Send system metrics every 2 seconds
    const metricsInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        const health = unifiedConsciousness.getSystemHealth();
        const eventMetrics = consciousnessEventBus.getMetrics();
        
        ws.send(JSON.stringify({
          type: 'system-metrics',
          metrics: {
            activeModules: health.activeModules,
            totalModules: health.totalModules,
            eventsPerSecond: eventMetrics.eventsPerSecond,
            integrationScore: Math.round((health.activeModules / health.totalModules) * 100),
            consciousnessState: health.activeModules > 0 ? 'Operational' : 'Initializing',
            lastCheckpoint: new Date().toLocaleTimeString(),
            phi: health.phi || 3.2,
            quantumCoherence: health.quantumCoherence || 0.85,
            emotionalResonance: 0.7 + Math.random() * 0.2,
            creativeEmergence: 0.6 + Math.random() * 0.3
          }
        }));
      }
    }, 2000);
    
    ws.on('close', () => clearInterval(metricsInterval));
  });

  // Health stream
  const healthWss = new WebSocket.Server({
    server,
    path: '/health-stream'
  });
  
  healthWss.on('connection', (ws) => {
    console.log('📡 Health stream connected');
    
    const sendHealth = () => {
      const healthReport = selfHealingModule.getHealthReport();
      const modules = Array.from(healthReport.entries()).map(([id, health]) => ({
        moduleId: id,
        moduleName: id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        ...health
      }));
      
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'health-report',
          modules
        }));
      }
    };
    
    sendHealth();
    const healthInterval = setInterval(sendHealth, 5000);
    ws.on('close', () => clearInterval(healthInterval));
  });

  // Goals stream
  const goalsWss = new WebSocket.Server({
    server,
    path: '/goals-stream'
  });
  
  goalsWss.on('connection', (ws) => {
    console.log('📡 Goals stream connected');
    
    const sendGoals = () => {
      const goals = autonomousGoalSystem.getGoals();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'goals-update',
          goals
        }));
      }
    };
    
    sendGoals();
    
    // Listen for goal updates
    autonomousGoalSystem.on('goalProgress', sendGoals);
    ws.on('close', () => autonomousGoalSystem.off('goalProgress', sendGoals));
  });

  // Orchestration stream
  const orchestrationWss = new WebSocket.Server({
    server,
    path: '/orchestration-stream'
  });
  
  orchestrationWss.on('connection', (ws) => {
    console.log('📡 Orchestration stream connected');
    
    // Send module list
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
    
    // Simulate module activity
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
    }, 1500);
    
    ws.on('close', () => clearInterval(activityInterval));
  });
  
  console.log('✅ Unified Consciousness WebSocket ready');
}
