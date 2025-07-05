import fs from 'fs';

// Read ResearchTab.tsx
let content = fs.readFileSync('./src/components/research/ResearchTab.tsx', 'utf8');

// Update the response handling to support both formats
content = content.replace(
  `if (data.type === 'response' || data.type === 'unified_response') {
            const newMessage: Message = {
              id: Date.now().toString(),
              role: 'assistant',
              content: data.unifiedContent || data.content || data.message || 'Received response',
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
            
            // Update metrics if provided
            if (data.consciousness) {
              setMetrics({
                phi: data.consciousness.phiValue || data.consciousness.phi || 0,
                awareness_level: data.consciousness.awareness_level || 0,
                processing_frequency: data.consciousness.processing_frequency || 100
              });
            }
          }`
);

fs.writeFileSync('./src/components/research/ResearchTab.tsx', content);
console.log('Updated frontend response handling');
