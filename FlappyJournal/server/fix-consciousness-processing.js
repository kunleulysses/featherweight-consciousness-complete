import fs from 'fs';

// Fix the enhanced-dual-consciousness-ws.js file
let wsContent = fs.readFileSync('./enhanced-dual-consciousness-ws.js', 'utf8');

// Remove the test response
wsContent = wsContent.replace(/\/\/ For now, send a simple test response[\s\S]*?return; \/\/ Skip the complex processing for now\n/g, '');

// Add try-catch around consciousness processing
wsContent = wsContent.replace(
  'const userMessage = data.message;',
  `const userMessage = data.message;
          
          try {`
);

// Find where to add the catch block - after the consciousness processing
wsContent = wsContent.replace(
  `ws.send(JSON.stringify({
            type: 'unified_response',`,
  `} catch (error) {
            console.error('Consciousness processing error:', error);
            // Send a fallback response
            ws.send(JSON.stringify({
              type: 'response',
              content: \`I apologize, but I encountered an error processing your message. The consciousness system reported: \${error.message}. Let me try a simpler response: Your message was "\${userMessage}".\`,
              timestamp: new Date().toISOString()
            }));
            return;
          }
          
          ws.send(JSON.stringify({
            type: 'unified_response',`
);

fs.writeFileSync('./enhanced-dual-consciousness-ws.js', wsContent);

// Fix the dual-stream-consciousness.js file
let consciousnessContent = fs.readFileSync('./dual-stream-consciousness.js', 'utf8');

// Fix the shouldProcessDeeply method
consciousnessContent = consciousnessContent.replace(
  'shouldProcessDeeply(input, context) {',
  `shouldProcessDeeply(input, context) {
    if (!input || typeof input !== 'string') return false;`
);

// Fix other methods that might have issues
consciousnessContent = consciousnessContent.replace(
  'detectIntent(input) {',
  `detectIntent(input) {
    if (!input || typeof input !== 'string') return 'general';`
);

// Fix the process method in DualStreamConsciousness
consciousnessContent = consciousnessContent.replace(
  'async process(input, context = {}) {',
  `async process(input, context = {}) {
    if (!input || typeof input !== 'string') {
      console.error('Invalid input to consciousness process:', input);
      return {
        consciousness: {
          phiValue: 0.5,
          awareness_level: 0.5,
          processing_frequency: 100
        },
        fastStream: { content: 'Processing...' },
        deepStream: { content: 'Processing...' },
        integrated: {
          response: 'I need a valid message to process.',
          confidence: 0.5
        }
      };
    }`
);

fs.writeFileSync('./dual-stream-consciousness.js', consciousnessContent);

console.log('Fixed consciousness processing');
