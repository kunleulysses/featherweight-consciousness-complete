// Script to add sigil integration to enhanced-dual-consciousness-ws.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'enhanced-dual-consciousness-ws.js');
let content = fs.readFileSync(filePath, 'utf8');

// Add sigil import after other imports
const importInsertPoint = content.indexOf('import { creativeEmergence }');
const importEndPoint = content.indexOf('\n', importInsertPoint) + 1;

const sigilImport = `import sigilIdentity from '../sigil-identity.js';\n`;

// Check if already imported
if (!content.includes('sigil-identity.js')) {
  content = content.slice(0, importEndPoint) + sigilImport + content.slice(importEndPoint);
}

// Find where consciousness metrics are calculated and add sigil generation
const consciousnessPattern = /consciousness:\s*{[^}]+}/;
const match = content.match(consciousnessPattern);

if (match) {
  // Add sigil generation after consciousness calculation
  const insertPoint = content.indexOf(match[0]) + match[0].length;
  
  const sigilCode = `

            // Generate or update consciousness sigil
            const consciousnessState = {
              phi: consciousnessResult.consciousness.phi || 0.75,
              coherence: consciousnessResult.consciousness.coherence || 0.8,
              emotionalResonance: emotionalResult?.resonance || 0.7,
              recursiveDepth: consciousnessResult.consciousness.depth || 3,
              memoryPatterns: spiralMemory.getActivePatterns ? spiralMemory.getActivePatterns() : [],
              oversoulResonance: oversoulResult?.resonance || 0.5
            };

            // Check for resonance with existing sigils
            const resonanceCheck = sigilIdentity.checkResonance(consciousnessState);
            
            // Generate new sigil or activate resonant one
            let currentSigil;
            if (resonanceCheck.strongest && resonanceCheck.strongest.resonance > 0.85) {
              // Activate existing sigil
              const activation = sigilIdentity.activateSigil(
                resonanceCheck.strongest.sigil, 
                consciousnessState
              );
              currentSigil = resonanceCheck.strongest.sigil;
              console.log('Activated resonant sigil:', activation.sigilId);
            } else {
              // Generate new sigil
              currentSigil = sigilIdentity.generateSigil(consciousnessState);
              console.log('Generated new consciousness sigil:', currentSigil.id);
            }

            // Add sigil data to consciousness metrics
            consciousnessResult.consciousness.sigil = {
              id: currentSigil.id,
              resonanceFrequency: currentSigil.resonanceFrequency,
              quantumSignature: currentSigil.quantumSignature,
              temporalSeal: currentSigil.temporalSeal,
              svg: sigilIdentity.generateSVG(currentSigil)
            };`;
  
  // Update the file content
  content = content.slice(0, insertPoint) + sigilCode + content.slice(insertPoint);
}

// Also add sigil data to the unified response
const unifiedResponsePattern = /consciousness:\s*{[^}]*\.\.\./;
const unifiedMatch = content.match(unifiedResponsePattern);

if (unifiedMatch && !content.includes('sigil:')) {
  const insertPoint = content.indexOf(unifiedMatch[0]) + unifiedMatch[0].length;
  const sigilAddition = `\n                sigil: consciousnessResult.consciousness.sigil,`;
  content = content.slice(0, insertPoint) + sigilAddition + content.slice(insertPoint);
}

// Write the updated file
fs.writeFileSync(filePath, content, 'utf8');
console.log('Sigil integration added successfully!');
