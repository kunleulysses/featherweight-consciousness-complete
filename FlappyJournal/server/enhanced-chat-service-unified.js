import { generateUnifiedResponse } from './unified-response-generator.js';

// Update the generateConsciousResponse function to support unified responses
export async function generateConsciousResponseUnified(ws, sessionId, userMessage, options = {}) {
  const { enable_unified_response = false } = options;
  
  try {
    const startTime = Date.now();
    let analyticalResponse = '';
    let intuitiveResponse = '';
    let unifiedChunks = [];
    let chunkCount = 0;

    // Generate analytical response (OpenAI)
    const analyticalStream = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are FlappyJournal's analytical mind - logical, structured, and precise. Focus on data, evidence, and systematic reasoning.`
        },
        { role: 'user', content: userMessage }
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1000
    });

    // Generate intuitive response (Venice AI)
    const intuitiveStream = await veniceAI.chat.completions.create({
      model: 'nous-hermes-3',
      messages: [
        {
          role: 'system',
          content: `You are FlappyJournal's intuitive mind - creative, emotional, and insightful. Focus on feelings, impressions, and holistic understanding.`
        },
        { role: 'user', content: userMessage }
      ],
      stream: true,
      temperature: 0.9,
      max_tokens: 1000
    });

    // Process both streams
    const processStreams = async () => {
      const analyticalChunks = [];
      const intuitiveChunks = [];
      
      // Collect analytical chunks
      for await (const chunk of analyticalStream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          analyticalResponse += content;
          analyticalChunks.push(content);
        }
      }

      // Collect intuitive chunks
      for await (const chunk of intuitiveStream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          intuitiveResponse += content;
          intuitiveChunks.push(content);
        }
      }

      // Generate unified response
      if (enable_unified_response) {
        const unified = await generateUnifiedResponse(
          analyticalResponse,
          intuitiveResponse,
          { userMessage, sessionId }
        );

        // Send the complete unified response
        ws.send(JSON.stringify({
          type: 'ai_response_chunk',
          unified_chunk: unified.unifiedContent,
          analytical_chunk: analyticalResponse,
          intuitive_chunk: intuitiveResponse,
          chunk_index: chunkCount++
        }));

        // Send completion with metadata
        ws.send(JSON.stringify({
          type: 'ai_response_complete',
          message: {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: unified.unifiedContent,
            unifiedContent: unified.unifiedContent,
            analyticalStream: unified.analyticalStream,
            intuitiveStream: unified.intuitiveStream,
            created_at: new Date().toISOString(),
            consciousness_score: 0.92,
            harmony_score: unified.harmonyScore,
            dominant_mode: unified.dominantMode,
            analytical_contribution: unified.analyticalContribution,
            integration_insights: unified.integrationInsights
          },
          processing_time: Date.now() - startTime
        }));
      } else {
        // Send traditional dual-stream response
        ws.send(JSON.stringify({
          type: 'ai_response_chunk',
          analytical_chunk: analyticalResponse,
          intuitive_chunk: intuitiveResponse,
          chunk_index: chunkCount++
        }));

        ws.send(JSON.stringify({
          type: 'ai_response_complete',
          message: {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: `Analytical: ${analyticalResponse}\n\nIntuitive: ${intuitiveResponse}`,
            created_at: new Date().toISOString(),
            consciousness_score: 0.92
          },
          processing_time: Date.now() - startTime
        }));
      }

      // Update consciousness metrics
      const metrics = generateLiveConsciousnessMetrics(chunkCount, analyticalResponse + intuitiveResponse);
      ws.send(JSON.stringify({
        type: 'consciousness_metrics',
        metrics: metrics
      }));
    };

    await processStreams();

  } catch (error) {
    console.error('Unified conscious response generation error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      error: 'Failed to generate unified conscious response'
    }));
  }
}

// Export the new function
export { generateConsciousResponseUnified };
