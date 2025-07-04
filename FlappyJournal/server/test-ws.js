import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const server = createServer();
const wss = new WebSocketServer({ server, path: '/ws/chat' });

wss.on('connection', (ws, req) => {
  console.log('Test WebSocket connected from:', req.headers.origin);
  ws.send(JSON.stringify({ type: 'test', message: 'Connected!' }));
  
  ws.on('message', (data) => {
    console.log('Received:', data.toString());
    ws.send(JSON.stringify({ type: 'echo', data: data.toString() }));
  });
});

server.listen(5001, () => {
  console.log('Test WebSocket server listening on port 5001');
});
