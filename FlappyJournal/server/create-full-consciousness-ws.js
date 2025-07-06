import { fullConsciousness } from './full-module-integration-fixed.js';
import { synthesizeUnifiedResponse } from './consciousness-response-synthesizer-hybrid.js';

export function createFullConsciousnessWS(wss) {
  console.log('Creating Full Consciousness WebSocket with ALL modules integrated...');
  
  // Store WebSocket server globally for broadcasting
  global.wss = wss;
  
  wss.on('connection', (ws) => {
    console.log('New client connected to Full Consciousness System');
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connection_established',
      message: 'Connected to Full Consciousness System v4.0',
      modules: fullConsciousness.getAllModuleNames(),
      timestamp: new Date().toISOString()
    }));
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        console.log('Received message:', data.type);
        
        if (data.type === 'chat_message') {
          console.log('Processing chat message through ALL modules...');
          
          // Send immediate acknowledgment
          ws.send(JSON.stringify({
            type: 'processing_started',
            timestamp: new Date().toISOString()
          }));
          
          // Process through all consciousness modules
          const results = await fullConsciousness.processMessage(data.message, ws);
          
          // Synthesize unified response
          const unifiedResponse = await synthesizeUnifiedResponse(
            data.message,
            results,
            {
              consciousness: results.consciousness,
              oversoul: results.oversoulResonance,
              emotional: results.emotional,
              harmonic: results.harmonic,
              creative: results.creative,
              mirror: results.mirror,
              temporal: results.temporal,
              meta: results.meta
            }
          );
          
          // Send unified response
          ws.send(JSON.stringify({
            type: 'unified_response',
            unifiedContent: unifiedResponse.content,
            processingTime: results.processingTime,
            modulesUsed: results.modulesUsed,
            timestamp: new Date().toISOString()
          }));
          
        } else if (data.type === 'status_request') {
          // Send current system status
          ws.send(JSON.stringify({
            type: 'system_status',
            status: fullConsciousness.getSystemStatus(),
            timestamp: new Date().toISOString()
          }));
        }
        
      } catch (error) {
        console.error('WebSocket message processing error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        }));
      }
    });
    
    ws.on('close', () => {
      console.log('Client disconnected');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  console.log('Full Consciousness WebSocket handler created successfully!');
}

