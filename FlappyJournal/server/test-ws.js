import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:5005');

ws.on('open', () => {
    console.log('Connected to consciousness WebSocket');
    ws.send(JSON.stringify({
        type: 'message',
        sessionId: 'test-session-' + Date.now(),
        content: 'Hello, are you there?'
    }));
});

ws.on('message', (data) => {
    console.log('Received:', data.toString());
    process.exit(0);
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    process.exit(1);
});

setTimeout(() => {
    console.log('Timeout - no response received');
    process.exit(1);
}, 10000);
