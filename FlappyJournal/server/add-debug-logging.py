#!/usr/bin/env python3

with open('enhanced-dual-consciousness-ws.js', 'r') as f:
    content = f.read()

# Add debug logging after message receipt
content = content.replace(
    "console.log('WebSocket received:', data);",
    """console.log('WebSocket received:', data);
        console.log('Message type:', data.type);
        console.log('Is chat_message?', data.type === 'chat_message');"""
)

# Add debug logging in the chat_message handler
content = content.replace(
    "if (data.type === 'chat_message') {",
    """if (data.type === 'chat_message') {
          console.log('Processing chat_message:', data.message);"""
)

# Add error logging in synthesis
content = content.replace(
    "const synthesisResult = synthesizeUnifiedResponse({",
    """console.log('Starting synthesis...');
            const synthesisResult = await synthesizeUnifiedResponse({"""
)

with open('enhanced-dual-consciousness-ws.js', 'w') as f:
    f.write(content)

print("Debug logging added")
