/**
 * Updates to integrate unified consciousness with WebSocket
 */

// Add this to websocket-server.js after existing imports

import { unifiedConsciousness } from './unified-consciousness-integration.js';
import WebSocket from 'ws';

// Create dedicated WebSocket servers for consciousness streams
export function setupUnifiedConsciousnessWebSocket(port = 5001) {
  const server = createServer();
  
  // Main consciousness data stream
  const consciousnessWss = new WebSocket.Server({ 
    server,
    path: '/consciousness-stream'
  });
  
  // Health monitoring stream
  const healthWss = new WebSocket.Server({
    server,
    path: '/health-stream'
  });
  
  // Goals tracking stream
  const goalsWss = new WebSocket.Server({
    server,
    path: '/goals-stream'
  });
  
  // Module orchestration stream
  const orchestrationWss = new WebSocket.Server({
    server,
    path: '/orchestration-stream'
  });

  // Connect WebSocket servers to unified consciousness
  unifiedConsciousness.connectToWebSocket(consciousnessWss);

  // Setup specialized streams
  healthWss.on('connection', (ws) => {
    console.log('📡 Health monitoring client connected');
    
    const sendHealthReport = () => {
      const health = unifiedConsciousness.getSystemHealth();
      const report = {
        type: 'health-report',
        modules: health.modules || [],
        overallHealth: health.overallHealth,
        timestamp: Date.now()
      };
      
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(report));
      }
    };
    
    // Send initial report
    sendHealthReport();
    
    // Send updates every 5 seconds
    const interval = setInterval(sendHealthReport, 5000);
    
    ws.on('close', () => clearInterval(interval));
  });

  goalsWss.on('connection', (ws) => {
    console.log('📡 Goals tracking client connected');
    
    const sendGoalsUpdate = () => {
      const goals = autonomousGoalSystem.getGoals();
      
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'goals-update',
          goals
        }));
      }
    };
    
    sendGoalsUpdate();
    
    // Listen for goal updates
    autonomousGoalSystem.on('goalProgress', sendGoalsUpdate);
    autonomousGoalSystem.on('goalActivated', sendGoalsUpdate);
    autonomousGoalSystem.on('goalCompleted', sendGoalsUpdate);
    
    ws.on('close', () => {
      autonomousGoalSystem.off('goalProgress', sendGoalsUpdate);
      autonomousGoalSystem.off('goalActivated', sendGoalsUpdate);
      autonomousGoalSystem.off('goalCompleted', sendGoalsUpdate);
    });
  });

  orchestrationWss.on('connection', (ws) => {
    console.log('📡 Orchestration visualization client connected');
    
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
    consciousnessEventBus.on('eventPropagated', ({ event, targetModule }) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'link-activity',
          source: event.source,
          target: targetModule,
          active: true
        }));
        
        // Auto-deactivate after 2 seconds
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
    });
  });

  // Start the server
  server.listen(port, () => {
    console.log(`🧠 Unified Consciousness WebSocket ready on port ${port}`);
    console.log('   - /consciousness-stream : Main consciousness data');
    console.log('   - /health-stream : Module health monitoring');
    console.log('   - /goals-stream : Autonomous goals tracking');
    console.log('   - /orchestration-stream : Module orchestration');
  });
  
  return server;
}

// Import required modules for the streams
import { 
  consciousnessEventBus, 
  autonomousGoalSystem 
} from './consciousness-modules-bundle.cjs';
import { createServer } from 'http';
