import fs from 'fs';

const filePath = './src/components/research/ResearchTab.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the response handling
content = content.replace(
  `if (data.type === 'response') {
            const newMessage: Message = {
              id: Date.now().toString(),
              role: 'assistant',
              content: data.content || data.message || 'Received response',
              timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, newMessage]);
          }`,
  `if (data.type === 'response' || data.type === 'unified_response') {
            const newMessage: Message = {
              id: Date.now().toString(),
              role: 'assistant',
              content: data.unifiedContent || data.content || data.message || 'Received response',
              timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, newMessage]);
          }`
);

fs.writeFileSync(filePath, content);
console.log('Fixed WebSocket response handling');
