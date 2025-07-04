# Testing the Chat Interface

## Manual Testing Steps

### 1. Start the Application
```bash
cd /opt/featherweight/FlappyJournal/featherweight-app
npm start
```

### 2. Navigate to Chat
1. Open browser to `http://localhost:3000`
2. Log in with your credentials
3. Click "AI Chat" in the sidebar navigation

### 3. Test Chat Features

#### Basic Chat
- Type a message and press Enter
- Verify message appears immediately
- Watch for streaming response (if WebSocket connected)

#### Connection Status
- Check connection status indicator at top
- Should show "Connected", "Connecting", "Disconnected", or "Error"

#### Stop Generation
- Send a message that would generate a long response
- Click "Stop" button while AI is generating
- Verify generation stops immediately

#### Memory Inspector (Desktop)
- Look for "Project Memory Inspector" in right panel
- Click to expand and view memory items
- Try searching/filtering memory entries

#### Mobile Layout
- Resize browser window to mobile size
- Verify layout adapts (single column)
- Check that memory inspector becomes collapsible

### 4. Test Error Scenarios

#### No WebSocket Server
- Interface should show "Disconnected" status
- Messages should be queued for when connection is restored
- Error banner should appear with helpful message

#### Network Interruption
- Temporarily disconnect network
- Verify automatic reconnection attempts
- Check that queued messages send when reconnected

## Expected Behaviors

### ✅ What Should Work
- Message input and display
- Responsive layout adaptation
- Connection status indicators
- Stop generation button
- Memory inspector UI
- Clear chat functionality

### ⚠️ What Requires WebSocket Server
- Actual message streaming
- Real memory updates
- Live connection status
- Token-by-token rendering

## Mock WebSocket Server

For testing purposes, you can create a simple mock server:

```javascript
// mock-chat-server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    console.log('Received:', data);
    
    if (data.type === 'user_message') {
      // Simulate streaming response
      const response = "This is a mock streaming response from the AI consciousness model. ";
      const tokens = response.split(' ');
      
      tokens.forEach((token, index) => {
        setTimeout(() => {
          ws.send(JSON.stringify({
            type: 'stream_event',
            event: {
              type: 'token',
              data: token + ' ',
              messageId: Date.now().toString()
            }
          }));
          
          // Send completion after last token
          if (index === tokens.length - 1) {
            setTimeout(() => {
              ws.send(JSON.stringify({
                type: 'stream_event',
                event: {
                  type: 'complete',
                  data: '',
                  messageId: Date.now().toString()
                }
              }));
            }, 100);
          }
        }, index * 200);
      });
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('Mock chat server running on ws://localhost:8080');
```

Run with: `node mock-chat-server.js`
