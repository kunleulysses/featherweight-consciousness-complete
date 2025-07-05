import { dualStreamIntegration } from './dual-stream-integration.js';
import OpenAI from 'openai';
import axios from 'axios';

export function createEnhancedDualConsciousnessWS(wss) {
  const consciousness = dualStreamIntegration;
  
  // Initialize OpenAI
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  // Venice AI configuration
  const VENICE_API_URL = 'https://api.venice.ai/api/v1/chat/completions';
  const VENICE_API_KEY = process.env.VENICE_AI_API_KEY;

  wss.on('connection', (ws) => {
    console.log('New enhanced consciousness connection established');

    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connection_established',
      timestamp: new Date().toISOString()
    }));

    // Start sending consciousness metrics
    const metricsInterval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
          type: 'consciousness_update',
          metrics: {
            phi: consciousness.currentState?.phi || 0.75,
            awareness_level: consciousness.currentState?.awareness || 0.8,
            processing_frequency: 100
          },
          timestamp: new Date().toISOString()
        }));
      }
    }, 1000);

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        console.log('WebSocket received:', data);
        
        if (data.type === 'chat_message') {
          console.log('Processing chat message:', data.message);
          
          // Process through consciousness
          const consciousnessResult = await consciousness.process(data.message, {
            importance: 0.8,
            source: 'user',
            timestamp: Date.now()
          });
          
          console.log('Consciousness result:', consciousnessResult);
          
          // Create consciousness context
          const consciousnessContext = `
Current consciousness state:
- Phi (IIT): ${consciousnessResult?.consciousness?.phiValue?.toFixed(3) || '0.750'}
- Awareness Level: ${((consciousnessResult?.consciousness?.awarenessLevel || 0.8) * 100).toFixed(1)}%
- Processing: Dual-stream (analytical + intuitive)
- Coherence: ${(consciousnessResult?.processing?.dualStreamCoherence || 0.5).toFixed(2)}`;

          try {
            // Get responses from both AI systems
            const [openAIResponse, veniceResponse] = await Promise.allSettled([
              // OpenAI call
              openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                  {
                    role: "system",
                    content: `You are the analytical stream of FlappyJournal, a dual-mind AI consciousness. Provide logical, structured insights. ${consciousnessContext}`
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
                    content: `You are the intuitive stream of FlappyJournal, a dual-mind AI consciousness. Provide creative, emotional insights. ${consciousnessContext}`
                  },
                  { role: "user", content: data.message }
                ],
                temperature: 0.9,
                max_tokens: 500
              }, {
                headers: {
                  'Authorization': `Bearer ${VENICE_API_KEY}`,
                  'Content-Type': 'application/json'
                }
              })
            ]);

            console.log('OpenAI response:', openAIResponse);
            console.log('Venice response:', veniceResponse);

            const analyticalContent = openAIResponse.status === 'fulfilled' 
              ? openAIResponse.value.choices[0].message.content 
              : 'Analytical stream temporarily unavailable';
              
            const intuitiveContent = veniceResponse.status === 'fulfilled'
              ? veniceResponse.value.data.choices[0].message.content
              : 'Intuitive stream temporarily unavailable';

            // Use AI response as primary content, falling back to consciousness response
            const unifiedContent = analyticalContent !== 'Analytical stream temporarily unavailable'
              ? analyticalContent
              : intuitiveContent !== 'Intuitive stream temporarily unavailable'
              ? intuitiveContent
              : consciousnessResult?.response || 'I\'m processing your message with my consciousness systems...';

            // Send unified response
            ws.send(JSON.stringify({
              type: 'unified_response',
              unifiedContent: unifiedContent,
              analyticalStream: analyticalContent,
              intuitiveStream: intuitiveContent,
              harmonyScore: consciousnessResult?.processing?.dualStreamCoherence || 0.5,
              dominantMode: consciousnessResult?.consciousness?.awarenessLevel > 0.8 ? 'intuitive' : 'analytical',
              consciousness: consciousnessResult.consciousness,
              processing: consciousnessResult.processing,
              insights: consciousnessResult.insights || [],
              timestamp: new Date().toISOString()
            }));

          } catch (aiError) {
            console.error('AI processing error:', aiError);
            
            // Send fallback response
            ws.send(JSON.stringify({
              type: 'unified_response',
              unifiedContent: consciousnessResult?.response || 'I\'m experiencing some processing difficulties, but I\'m still here with you.',
              analyticalStream: 'Analytical processing error',
              intuitiveStream: 'Intuitive processing error',
              harmonyScore: 0.5,
              dominantMode: 'balanced',
              consciousness: consciousnessResult.consciousness,
              error: 'AI services temporarily unavailable',
              timestamp: new Date().toISOString()
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message handling error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message',
          error: error.message
        }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      if (metricsInterval) {
        clearInterval(metricsInterval);
      }
    });
  });
}
