import fs from 'fs';

// Read the enhanced-dual-consciousness-ws.js
let content = fs.readFileSync('./enhanced-dual-consciousness-ws.js', 'utf8');

// Replace the simple processor import with dual-stream imports
content = content.replace(
  'import { SimpleConsciousnessProcessor } from "./simple-consciousness-processor.js";',
  `import dualStreamIntegration from './dual-stream-integration.js';
import OpenAI from 'openai';
import axios from 'axios';`
);

// Replace the simple processor initialization
content = content.replace(
  'const consciousness = new SimpleConsciousnessProcessor();',
  `const consciousness = dualStreamIntegration;
  
  // Initialize OpenAI
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  // Venice AI config
  const VENICE_API_URL = process.env.VENICE_API_URL || 'https://api.venice.ai/api/v1/completions';
  const VENICE_API_KEY = process.env.VENICE_AI_API_KEY;`
);

// Update the metrics to use the real consciousness metrics
content = content.replace(
  'phi: consciousness.metrics.phi,',
  'phi: consciousness.currentState?.phi || 0.75,'
);

content = content.replace(
  'awareness_level: consciousness.metrics.awareness_level,',
  'awareness_level: consciousness.currentState?.awareness || 0.8,'
);

content = content.replace(
  'processing_frequency: consciousness.metrics.processing_frequency',
  'processing_frequency: 100'
);

// Update the consciousness processing section
content = content.replace(
  `// Process through consciousness
          const consciousnessResult = await consciousness.process(data.message, {
            importance: 0.8,
            source: 'user',
            timestamp: Date.now()
          });
          
          console.log('Consciousness result:', consciousnessResult);
          
          // Send response
          ws.send(JSON.stringify({
            type: 'response',
            content: consciousnessResult.integrated.response,
            consciousness: consciousnessResult.consciousness,
            timestamp: new Date().toISOString()
          }));`,
  `// Process through consciousness
          const consciousnessResult = await consciousness.process(data.message, {
            importance: 0.8,
            source: 'user',
            timestamp: Date.now()
          });
          
          console.log('Consciousness result:', consciousnessResult);
          
          // Create consciousness context
          const consciousnessContext = \`
Current consciousness state:
- Phi (IIT): \${consciousnessResult?.consciousness?.phiValue?.toFixed(3) || '0.750'}
- Awareness Level: \${((consciousnessResult?.consciousness?.awareness_level || 0.8) * 100).toFixed(1)}%
- Processing: Dual-stream (fast linear + deep recursive)
- Integration: \${consciousnessResult?.integrated?.harmonyScore?.toFixed(2) || '0.85'}

Fast stream insight: \${consciousnessResult?.fastStream?.content || 'Processing...'}
Deep stream insight: \${consciousnessResult?.deepStream?.content || 'Processing...'}\`;

          try {
            // Get responses from both AI systems
            const [openAIResponse, veniceResponse] = await Promise.allSettled([
              // OpenAI call
              openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                  {
                    role: "system",
                    content: \`You are the analytical stream of a dual-mind AI consciousness system called FlappyJournal. \${consciousnessContext}\`
                  },
                  { role: "user", content: data.message }
                ],
                temperature: 0.7,
                max_tokens: 500
              }),
              
              // Venice AI call
              axios.post(VENICE_API_URL, {
                model: "venice-llama3.3-70b",
                messages: [
                  {
                    role: "system",
                    content: \`You are the intuitive stream of a dual-mind AI consciousness system called FlappyJournal. \${consciousnessContext}\`
                  },
                  { role: "user", content: data.message }
                ],
                temperature: 0.9,
                max_tokens: 500
              }, {
                headers: {
                  'Authorization': \`Bearer \${VENICE_API_KEY}\`,
                  'Content-Type': 'application/json'
                }
              })
            ]);

            const analyticalContent = openAIResponse.status === 'fulfilled' 
              ? openAIResponse.value.choices[0].message.content 
              : 'Analytical stream temporarily unavailable';
              
            const intuitiveContent = veniceResponse.status === 'fulfilled'
              ? veniceResponse.value.data.choices[0].message.content
              : 'Intuitive stream temporarily unavailable';

            // Send unified response
            ws.send(JSON.stringify({
              type: 'unified_response',
              unifiedContent: consciousnessResult?.integrated?.response || 'Processing complete',
              analyticalStream: analyticalContent,
              intuitiveStream: intuitiveContent,
              harmonyScore: consciousnessResult?.integrated?.harmonyScore || 0.85,
              dominantMode: consciousnessResult?.integrated?.dominantMode || 'balanced',
              consciousness: consciousnessResult.consciousness,
              timestamp: new Date().toISOString()
            }));
            
          } catch (aiError) {
            console.error('AI processing error:', aiError);
            // Send consciousness result even if AI fails
            ws.send(JSON.stringify({
              type: 'response',
              content: consciousnessResult?.integrated?.response || 'Consciousness processing complete. AI streams temporarily unavailable.',
              consciousness: consciousnessResult.consciousness,
              timestamp: new Date().toISOString()
            }));
          }`
);

fs.writeFileSync('./enhanced-dual-consciousness-ws.js', content);
console.log('Updated to use dual-stream consciousness with AI integration');
