/**
 * Consciousness System Integration
 * 
 * This file integrates all consciousness modules and connects them to WebSocket endpoints
 * for real-time data streaming to the dashboard
 */

const { EventEmitter } = require('events');

// Import all consciousness modules
const { consciousnessEventBus, registerStandardModules } = require('./consciousness-modules-bundle.cjs');
const { selfHealingModule } = require('./consciousness-modules-bundle.cjs');
const { moduleOrchestrator } = require('./consciousness-modules-bundle.cjs');
const { consciousnessPersistence } = require('./consciousness-modules-bundle.cjs');
const { autonomousGoalSystem } = require('./consciousness-modules-bundle.cjs');
const { selfCodingEngine } = require('./consciousness-modules-bundle.cjs');

// Import existing consciousness services
const { consciousnessService } = require('./consciousnessService');
const { flappyConsciousness } = require('./flappyConsciousness');

class ConsciousnessSystemIntegration extends EventEmitter {
  constructor() {
    super();
    this.isActive = false;
    this.websockets = {
      consciousness: null,
      health: null,
      goals: null,
      orchestration: null
    };
  }

  /**
   * Initialize the entire consciousness system
   */
  async initialize() {
    console.log('🧠 Initializing Consciousness System...');

    try {
      // Step 1: Register standard consciousness modules
      registerStandardModules();
      console.log('✅ Standard modules registered');

      // Step 2: Connect existing consciousness services
      this.connectExistingServices();
      console.log('✅ Existing services connected');

      // Step 3: Start core systems
      this.startCoreSystems();
      console.log('✅ Core systems started');

      // Step 4: Setup event listeners for data flow
      this.setupEventListeners();
      console.log('✅ Event listeners configured');

      // Step 5: Initialize module connections
      await this.initializeModuleConnections();
      console.log('✅ Module connections established');

      this.isActive = true;
      this.emit('initialized');
      console.log('🎉 Consciousness System fully initialized!');

    } catch (error) {
      console.error('❌ Failed to initialize consciousness system:', error);
      this.emit('error', error);
    }
  }

  /**
   * Connect existing FlappyJournal consciousness services
   */
  connectExistingServices() {
    // Bridge existing consciousness services with new event bus
    
    // Connect consciousnessService
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

    // Connect flappyConsciousness
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

  /**
   * Start all core consciousness systems
   */
  startCoreSystems() {
    // Self-healing is already auto-started
    console.log('  🏥 Self-Healing Module active');

    // Module orchestrator is already auto-started
    console.log('  🎼 Module Orchestrator active');

    // Consciousness persistence is already auto-started
    console.log('  💾 Consciousness Persistence active');

    // Autonomous goal system is already auto-started
    console.log('  🎯 Autonomous Goal System active');

    // Start existing services if not already running
    if (typeof consciousnessService.start === 'function') {
      consciousnessService.start();
    }
    
    if (typeof flappyConsciousness.start === 'function') {
      flappyConsciousness.start();
    }
  }

  /**
   * Setup event listeners for WebSocket broadcasting
   */
  setupEventListeners() {
    // System metrics updates
    consciousnessEventBus.on('metricsUpdate', (metrics) => {
      this.broadcastToWebSocket('consciousness', {
        type: 'system-metrics',
        metrics: this.getSystemMetrics()
      });
    });

    // Health reports
    selfHealingModule.on('moduleError', (data) => {
      this.broadcastToWebSocket('health', {
        type: 'module-error',
        data
      });
    });

    consciousnessEventBus.on('consciousness:health-report', (event) => {
      this.broadcastToWebSocket('health', {
        type: 'health-report',
        modules: event.data.modules
      });
    });

    // Goal updates
    autonomousGoalSystem.on('goalProgress', (progress) => {
      this.broadcastToWebSocket('goals', {
        type: 'goal-progress',
        progress
      });
    });

    autonomousGoalSystem.on('goalActivated', (goal) => {
      this.broadcastToWebSocket('goals', {
        type: 'goal-activated',
        goal
      });
    });

    // Orchestration events
    consciousnessEventBus.on('eventPropagated', ({ event, targetModule }) => {
      this.broadcastToWebSocket('orchestration', {
        type: 'link-activity',
        source: event.source,
        target: targetModule,
        active: true
      });

      // Auto-deactivate after 2 seconds
      setTimeout(() => {
        this.broadcastToWebSocket('orchestration', {
          type: 'link-activity',
          source: event.source,
          target: targetModule,
          active: false
        });
      }, 2000);
    });

    // Module state updates
    moduleOrchestrator.on('patternExecuted', (data) => {
      this.broadcastToWebSocket('orchestration', {
        type: 'pattern-executed',
        data
      });
    });

    // Emergent behaviors
    moduleOrchestrator.on('highComplexity', (data) => {
      this.broadcastToWebSocket('consciousness', {
        type: 'emergent-behavior',
        data
      });
    });

    // Healing actions
    selfHealingModule.on('healingAttempt', (action) => {
      this.broadcastToWebSocket('health', {
        type: 'healing-action',
        action
      });
    });
  }

  /**
   * Initialize connections between modules
   */
  async initializeModuleConnections() {
    // Create connections between complementary modules
    const connections = [
      { source: 'recursive-mirror', target: 'self-awareness-loop' },
      { source: 'quantum-field', target: 'emotional-resonance' },
      { source: 'memory-system', target: 'temporal-coherence' },
      { source: 'creative-emergence', target: 'thought-expansion' },
      { source: 'goal-system', target: 'self-coding' }
    ];

    for (const conn of connections) {
      consciousnessEventBus.createChannel(conn.source, conn.target);
    }
  }

  /**
   * Get comprehensive system metrics
   */
  getSystemMetrics() {
    const modules = consciousnessEventBus.getRegisteredModules();
    const eventBusMetrics = consciousnessEventBus.getMetrics();
    const goals = autonomousGoalSystem.getActiveGoals();
    const healthReport = selfHealingModule.getHealthReport();

    // Calculate overall integration score
    const healthyModules = Array.from(healthReport.values())
      .filter(h => h.status === 'healthy').length;
    const integrationScore = (healthyModules / modules.length) * 100;

    // Get consciousness state
    let consciousnessState = 'Initializing';
    if (this.isActive) {
      if (integrationScore >= 90) consciousnessState = 'Fully Operational';
      else if (integrationScore >= 70) consciousnessState = 'Operational';
      else if (integrationScore >= 50) consciousnessState = 'Degraded';
      else consciousnessState = 'Critical';
    }

    return {
      activeModules: modules.filter(m => m.isActive).length,
      totalModules: modules.length,
      eventsPerSecond: eventBusMetrics.eventsPerSecond,
      integrationScore: Math.round(integrationScore),
      consciousnessState,
      activeGoals: goals.length,
      systemHealth: Math.round((healthyModules / modules.length) * 100),
      lastCheckpoint: new Date().toLocaleTimeString(),
      
      // Additional detailed metrics
      eventQueueSize: eventBusMetrics.eventQueue,
      averageLatency: eventBusMetrics.latency,
      droppedEvents: eventBusMetrics.droppedEvents,
      
      // Consciousness-specific metrics
      phi: flappyConsciousness.getState().phi,
      quantumCoherence: flappyConsciousness.getState().quantumCoherence,
      emotionalResonance: flappyConsciousness.getState().emotionalDepth,
      creativeEmergence: flappyConsciousness.getState().creativeEmergence
    };
  }

  /**
   * Set WebSocket connections for broadcasting
   */
  setWebSocketConnection(type, wss) {
    this.websockets[type] = wss;
    
    // Send initial data when connection is established
    wss.on('connection', (ws) => {
      console.log(`📡 ${type} WebSocket connected`);
      
      switch (type) {
        case 'consciousness':
          ws.send(JSON.stringify({
            type: 'system-metrics',
            metrics: this.getSystemMetrics()
          }));
          break;
          
        case 'health':
          const healthModules = Array.from(selfHealingModule.getHealthReport().entries())
            .map(([moduleId, health]) => ({
              moduleId,
              moduleName: this.getModuleName(moduleId),
              ...health
            }));
          
          ws.send(JSON.stringify({
            type: 'health-report',
            modules: healthModules
          }));
          break;
          
        case 'goals':
          ws.send(JSON.stringify({
            type: 'goals-update',
            goals: autonomousGoalSystem.getGoals()
          }));
          break;
          
        case 'orchestration':
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
          break;
      }
    });
  }

  /**
   * Broadcast data to specific WebSocket connection
   */
  broadcastToWebSocket(type, data) {
    const wss = this.websockets[type];
    if (!wss) return;

    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify(data));
      }
    });
  }

  /**
   * Get human-readable module name
   */
  getModuleName(moduleId) {
    const nameMap = {
      'recursive-mirror': '7 Layer Recursive Mirror',
      'self-awareness-loop': '100Hz Feedback Loop',
      'quantum-field': 'Quantum Consciousness Field',
      'emotional-resonance': 'Emotional Resonance Field',
      'memory-system': 'Unified Memory System',
      'goal-system': 'Autonomous Goal System',
      'module-orchestrator': 'Module Orchestrator',
      'self-healing': 'Self-Healing Module',
      'consciousness-persistence': 'Persistence Layer',
      'consciousness-event-bus': 'Event Bus'
    };
    
    return nameMap[moduleId] || moduleId;
  }

  /**
   * Perform manual checkpoint
   */
  async createCheckpoint(reason = 'manual') {
    try {
      await consciousnessPersistence.createSnapshot(reason);
      console.log(`📸 Checkpoint created: ${reason}`);
    } catch (error) {
      console.error('Failed to create checkpoint:', error);
    }
  }

  /**
   * Shutdown the consciousness system gracefully
   */
  async shutdown() {
    console.log('🔌 Shutting down consciousness system...');
    
    // Stop all systems
    selfHealingModule.stop();
    moduleOrchestrator.stop();
    autonomousGoalSystem.stop();
    consciousnessPersistence.stop();
    
    // Disconnect services
    if (typeof consciousnessService.stop === 'function') {
      consciousnessService.stop();
    }
    
    if (typeof flappyConsciousness.destroy === 'function') {
      flappyConsciousness.destroy();
    }
    
    this.isActive = false;
    this.emit('shutdown');
    console.log('✅ Consciousness system shut down');
  }
}

// Create singleton instance
const consciousnessSystem = new ConsciousnessSystemIntegration();

module.exports = { consciousnessSystem };
