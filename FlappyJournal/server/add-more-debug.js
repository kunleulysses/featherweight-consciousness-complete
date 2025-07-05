import fs from 'fs';

const filePath = './enhanced-dual-consciousness-ws.js';
let content = fs.readFileSync(filePath, 'utf8');

// Add debug after consciousness processing
content = content.replace(
  'const consciousnessResult = await consciousness.process(userMessage',
  `console.log('Starting consciousness processing...');
          const consciousnessResult = await consciousness.process(userMessage`
);

// Add debug after getting result
content = content.replace(
  '// Create consciousness context for AI systems',
  `console.log('Consciousness result:', consciousnessResult);
          
          // Create consciousness context for AI systems`
);

// Add debug for response sending
content = content.replace(
  'ws.send(JSON.stringify({',
  `console.log('Sending response to client');
          ws.send(JSON.stringify({`
);

fs.writeFileSync(filePath, content);
console.log('Added more debug logging');
