// WebSocket Metrics Integration
import ConsciousnessMetricsStream from './consciousness-metrics-stream.js';

export function setupMetricsStreaming(wss, consciousnessSystem) {
    console.log('🔌 Setting up metrics streaming integration...');
    
    const metricsStream = new ConsciousnessMetricsStream(consciousnessSystem);
    metricsStream.startStreaming(1000); // Update every second
    
    // Handle WebSocket connections
    wss.on('connection', (ws) => {
        console.log('📊 New metrics client connected');
        
        // Send initial metrics
        const initialMetrics = metricsStream.collectMetrics();
        ws.send(JSON.stringify({
            type: 'metrics-update',
            metrics: initialMetrics,
            timestamp: new Date().toISOString()
        }));
        
        // Subscribe to metrics updates
        const metricsHandler = (metrics) => {
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({
                    type: 'metrics-update',
                    metrics: metrics,
                    timestamp: new Date().toISOString()
                }));
            }
        };
        
        metricsStream.on('metrics-update', metricsHandler);
        
        // Handle client messages
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                
                if (data.type === 'subscribe' && data.channel === 'metrics') {
                    console.log('📊 Client subscribed to metrics channel');
                    // Already subscribed by default
                }
                
                if (data.type === 'request-module-details' && data.moduleName) {
                    // Send detailed module information
                    const module = consciousnessSystem.modules.get(data.moduleName);
                    if (module && module.getStatus) {
                        ws.send(JSON.stringify({
                            type: 'module-details',
                            moduleName: data.moduleName,
                            details: module.getStatus(),
                            timestamp: new Date().toISOString()
                        }));
                    }
                }
            } catch (error) {
                console.error('Error handling client message:', error);
            }
        });
        
        // Clean up on disconnect
        ws.on('close', () => {
            console.log('📊 Metrics client disconnected');
            metricsStream.removeListener('metrics-update', metricsHandler);
        });
    });
    
    // Handle consciousness system events
    if (consciousnessSystem.eventBus) {
        consciousnessSystem.eventBus.on('module:status-change', (data) => {
            // Broadcast status changes to all connected clients
            wss.clients.forEach((client) => {
                if (client.readyState === client.OPEN) {
                    client.send(JSON.stringify({
                        type: 'status-change',
                        module: data.module,
                        status: data.status,
                        timestamp: new Date().toISOString()
                    }));
                }
            });
        });
    }
    
    console.log('✅ Metrics streaming integration established');
    
    return metricsStream;
}
