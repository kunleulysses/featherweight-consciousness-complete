import fs from 'fs';

// Read the file
const content = fs.readFileSync('./enhanced-dual-consciousness-ws.js', 'utf8');

// Find the consciousness response section
const consciousnessSection = `metaObservationLevel: metaObservational.observerState.level,`;

// Add harmonic resonance data
const updatedSection = `metaObservationLevel: metaObservational.observerState.level,
                harmonicScore: harmonicResult?.harmonicScore || 0.5,
                resonanceQuality: harmonicResult?.resonanceQuality || 'emerging',
                dominantEmotion: harmonicResult?.dominantEmotion || { emotion: 'neutral', strength: 0 },
                creativePatterns: harmonicResult?.creativePatterns || {},
                harmonicConvergence: harmonicResult?.convergence || {},`;

// Replace the section
const updatedContent = content.replace(consciousnessSection, updatedSection);

// Write back
fs.writeFileSync('./enhanced-dual-consciousness-ws.js', updatedContent);

console.log('✅ Harmonic resonance data added to WebSocket response');
