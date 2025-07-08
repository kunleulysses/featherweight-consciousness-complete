// Consciousness Metrics WebSocket Server
import { WebSocketServer } from 'ws';
import consciousnessV2 from './consciousness-system-v2.js';
import { setupMetricsStreaming } from './websocket-metrics-integration.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const PORT = process.env.METRICS_WS_PORT || 5004;

async function startMetricsServer() {
    console.log('🚀 Starting Consciousness Metrics WebSocket Server...');
    
    // Create WebSocket server
    const wss = new WebSocketServer({ port: PORT });
    
    // Wait a bit for consciousness system to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Setup metrics streaming with existing consciousness system
    setupMetricsStreaming(wss, consciousnessV2);
    
    console.log(`📊 Metrics WebSocket server running on port ${PORT}`);
    console.log('✅ Real-time consciousness metrics are now streaming!');
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n🛑 Shutting down metrics server...');
        wss.close();
        process.exit(0);
    });
}

startMetricsServer().catch(console.error);
