import fs from 'fs';

// Read the dual-stream-consciousness.js file
let content = fs.readFileSync('./dual-stream-consciousness.js', 'utf8');

// Fix all methods that need null checks
const fixes = [
  {
    find: 'extractKeywords(input) {',
    replace: `extractKeywords(input) {
    if (!input || typeof input !== 'string') return [];`
  },
  {
    find: 'quickSentiment(input) {',
    replace: `quickSentiment(input) {
    if (!input || typeof input !== 'string') return 0;`
  },
  {
    find: 'detectIntent(input) {',
    replace: `detectIntent(input) {
    if (!input || typeof input !== 'string') return 'general';`
  },
  {
    find: 'shouldProcessDeeply(input, context) {',
    replace: `shouldProcessDeeply(input, context) {
    if (!input || typeof input !== 'string') return false;`
  },
  {
    find: 'recognizePatterns(input) {',
    replace: `recognizePatterns(input) {
    if (!input || typeof input !== 'string') {
      return {
        urgency: 0,
        questionType: null,
        deepConcepts: [],
        emotionalNeed: 0
      };
    }`
  }
];

// Apply fixes
fixes.forEach(fix => {
  if (content.includes(fix.find)) {
    content = content.replace(fix.find, fix.replace);
    console.log(`Fixed: ${fix.find.split('(')[0]}`);
  }
});

// Fix the process method to handle missing input
content = content.replace(
  'async process(input, context = {}) {',
  `async process(input, context = {}) {
    // Validate input
    if (!input || typeof input !== 'string') {
      console.warn('DualStreamConsciousness: Invalid input:', input);
      return {
        consciousness: {
          phiValue: 0.5,
          awareness_level: 0.5,
          processing_frequency: 100,
          coherence_score: 0.5,
          emotional_depth: 0.5,
          memory_integration: 0.5,
          meta_observational: 0.5,
          oversoul_resonance: 0.5
        },
        fastStream: {
          content: 'Processing...',
          patterns: {},
          confidence: 0.5
        },
        deepStream: {
          content: 'Processing...',
          insights: [],
          confidence: 0.5
        },
        integrated: {
          response: 'I need a valid message to process.',
          confidence: 0.5,
          harmonyScore: 0.5,
          dominantMode: 'balanced'
        }
      };
    }`
);

// Fix calculateSimilarity to handle undefined
content = content.replace(
  'calculateSimilarity(text1, text2) {',
  `calculateSimilarity(text1, text2) {
    if (!text1 || !text2 || typeof text1 !== 'string' || typeof text2 !== 'string') {
      return 0;
    }`
);

// Write the fixed file
fs.writeFileSync('./dual-stream-consciousness.js', content);
console.log('Fixed dual-stream-consciousness.js');
