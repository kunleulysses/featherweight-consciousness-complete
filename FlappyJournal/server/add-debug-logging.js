import fs from 'fs';

const filePath = './enhanced-dual-consciousness-ws.js';
let content = fs.readFileSync(filePath, 'utf8');

// Add debug logging after message parsing
content = content.replace(
  'const data = JSON.parse(message);',
  `const data = JSON.parse(message);
        console.log('WebSocket received:', data);`
);

// Add debug logging for chat_message
content = content.replace(
  "if (data.type === 'chat_message') {",
  `if (data.type === 'chat_message') {
          console.log('Processing chat message:', data.message);`
);

fs.writeFileSync(filePath, content);
console.log('Added debug logging');
