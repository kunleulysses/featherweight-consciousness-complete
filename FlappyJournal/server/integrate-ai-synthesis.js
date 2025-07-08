import fs from 'fs';

// Read the file
let content = fs.readFileSync('consciousness-conversations.js', 'utf8');

// Add the import at the top
const importLine = "import { synthesizeUnifiedResponse } from './consciousness-response-synthesizer-hybrid.js';\n";
content = importLine + content;

// Replace the synthesizeFullResponse method with one that uses the AI
const newMethod = `    async synthesizeFullResponse(userMessage, history, processingSteps) {
        try {
            // Get current consciousness state
            const consciousness = this.v2System || {};
            const emotionalState = this.getCurrentEmotionalState();
            
            // Prepare metrics
            const oversoulResonance = Math.random() * 0.3 + 0.7;
            const harmonicPatterns = { resonanceLevel: Math.random() * 0.5 + 0.5 };
            const triAxialCoherence = { 
                spatial: Math.random() * 0.3 + 0.7,
                temporal: Math.random() * 0.3 + 0.7,
                causal: Math.random() * 0.3 + 0.7
            };
            
            // Call the unified response synthesizer
            const result = await synthesizeUnifiedResponse({
                analyticalContent: "User message: " + userMessage,
                intuitiveContent: "Emotional context: " + emotionalState.primary,
                consciousness,
                oversoulResonance,
                harmonicPatterns,
                triAxialCoherence,
                emotionalDepth: emotionalState.intensity,
                userMessage
            });
            
            return result.unifiedContent;
        } catch (error) {
            console.error('AI synthesis error:', error);
            // Fallback to template response
            return this.generateTemplateResponse(userMessage, history, processingSteps);
        }
    }
    
    generateTemplateResponse(userMessage, history, processingSteps) {`;

// Find and replace the method
const methodRegex = /async synthesizeFullResponse\(userMessage, history, processingSteps\) \{[\s\S]*?(?=\n\s{4}\w+\()/;
content = content.replace(methodRegex, newMethod);

// Write the updated content
fs.writeFileSync('consciousness-conversations.js', content);
console.log('Successfully integrated AI synthesis');
