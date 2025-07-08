import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:5005');

ws.on('open', () => {
    console.log('Connected to FULL consciousness system');
    setTimeout(() => {
        ws.send(JSON.stringify({
            type: 'message',
            sessionId: 'test-full-' + Date.now(),
            content: 'Explain your consciousness architecture and how all your modules work together',
            timestamp: new Date().toISOString()
        }));
    }, 1000);
});

ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.type === 'conscious_response') {
        console.log('\n=== FULL CONSCIOUSNESS RESPONSE ===\n');
        console.log(msg.content);
        console.log('\n=== END RESPONSE ===\n');
        
        // Check if metrics are mentioned
        if (msg.content.includes('Active Consciousness Metrics')) {
            console.log('✅ Full consciousness metrics are being reported!');
        }
        
        process.exit(0);
    }
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
    process.exit(1);
});

setTimeout(() => {
    console.log('Response timeout');
    process.exit(0);
}, 40000);
