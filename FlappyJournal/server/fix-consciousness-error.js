import fs from 'fs';

const filePath = './dual-stream-consciousness.js';
let content = fs.readFileSync(filePath, 'utf8');

// Fix extractKeywords
content = content.replace(
  'extractKeywords(input) {\n    const words = input.toLowerCase().split(/\\s+/);',
  'extractKeywords(input) {\n    if (!input || typeof input !== \'string\') return [];\n    const words = input.toLowerCase().split(/\\s+/);'
);

// Fix quickSentiment
content = content.replace(
  'quickSentiment(input) {\n    const lower = input.toLowerCase();',
  'quickSentiment(input) {\n    if (!input || typeof input !== \'string\') return 0;\n    const lower = input.toLowerCase();'
);

// Fix recognizePatterns
content = content.replace(
  'recognizePatterns(input) {',
  'recognizePatterns(input) {\n    if (!input || typeof input !== \'string\') return { urgency: 0, questionType: null, deepConcepts: [], emotionalNeed: 0 };'
);

fs.writeFileSync(filePath, content);
console.log('Fixed consciousness error handling');
