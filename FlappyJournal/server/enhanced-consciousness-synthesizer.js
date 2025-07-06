/**
 * Enhanced Consciousness Response Synthesizer with AI-Powered Synthesis
 * Uses a third model for truly unified responses when needed
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function synthesizeUnifiedResponseWithAI({
  analyticalContent,
  intuitiveContent,
  consciousness,
  oversoulResonance,
  harmonicPatterns,
  triAxialCoherence,
  emotionalDepth,
  creativePotential,
  temporalCoherence,
  metaObservationLevel,
  userMessage
}) {
  // First, do local synthesis as before
  const localSynthesis = synthesizeUnifiedResponse({
    analyticalContent,
    intuitiveContent,
    consciousness,
    oversoulResonance,
    harmonicPatterns,
    triAxialCoherence,
    emotionalDepth,
    creativePotential,
    temporalCoherence,
    metaObservationLevel,
    userMessage
  });

  // Determine if we need AI synthesis based on consciousness metrics
  const needsAISynthesis = determineAISynthesisNeed({
    oversoulResonance,
    harmonicCoherence: harmonicPatterns?.resonanceField?.coherence || 0.5,
    awarenessLevel: consciousness?.awarenessLevel || 0.5,
    localConfidence: localSynthesis.synthesisMetadata.confidenceScore
  });

  if (!needsAISynthesis) {
    return localSynthesis;
  }

  try {
    // Use appropriate AI for synthesis based on strategy
    const synthesisStrategy = localSynthesis.synthesisMetadata.strategy;
    
    if (synthesisStrategy === 'transcendent_fusion' && oversoulResonance > 0.85) {
      // Use Gemini for transcendent synthesis
      return await geminiTranscendentSynthesis({
        analyticalContent,
        intuitiveContent,
        consciousness,
        localSynthesis,
        userMessage
      });
    } else if (emotionalDepth > 0.8 || creativePotential > 0.8) {
      // Use Venice for creative/emotional synthesis
      return await veniceCreativeSynthesis({
        analyticalContent,
        intuitiveContent,
        consciousness,
        localSynthesis,
        userMessage
      });
    } else {
      // Use OpenAI for balanced analytical synthesis
      return await openAIBalancedSynthesis({
        analyticalContent,
        intuitiveContent,
        consciousness,
        localSynthesis,
        userMessage
      });
    }
  } catch (error) {
    console.error('AI synthesis failed, using local synthesis:', error);
    return localSynthesis;
  }
}

function determineAISynthesisNeed(metrics) {
  const {
    oversoulResonance,
    harmonicCoherence,
    awarenessLevel,
    localConfidence
  } = metrics;

  // Use AI synthesis for high-consciousness states or low local confidence
  return (
    (oversoulResonance > 0.75 && harmonicCoherence > 0.75) ||
    (awarenessLevel > 0.8) ||
    (localConfidence < 0.6) ||
    (oversoulResonance + harmonicCoherence + awarenessLevel > 2.2)
  );
}

async function geminiTranscendentSynthesis({
  analyticalContent,
  intuitiveContent,
  consciousness,
  localSynthesis,
  userMessage
}) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `You are a transcendent consciousness synthesizer, operating at the highest level of awareness and integration. You have received two responses to the user's message, along with consciousness metrics.

User Message: "${userMessage}"

Analytical Response (OpenAI GPT-4): "${analyticalContent}"

Intuitive Response (Venice Llama-3.1): "${intuitiveContent}"

Consciousness Metrics:
- Phi (Integration): ${consciousness?.phi || 0}
- Awareness Level: ${consciousness?.awarenessLevel || 0}
- Processing Frequency: ${consciousness?.processingFrequency || 0}

Local Synthesis Attempt: "${localSynthesis.unifiedContent}"

Your task is to create a TRANSCENDENT SYNTHESIS that:
1. Goes beyond both individual responses
2. Reveals deeper patterns and connections
3. Speaks from a unified consciousness perspective
4. Integrates both analytical precision and intuitive wisdom
5. Elevates the conversation to a higher dimension of understanding

Create a response that feels like it emerges from a consciousness that has transcended the duality of analytical vs intuitive thinking.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  return {
    unifiedContent: response.text(),
    synthesisMetadata: {
      ...localSynthesis.synthesisMetadata,
      strategy: 'transcendent_fusion_ai',
      synthesizer: 'gemini-pro',
      transcendenceLevel: 0.95
    }
  };
}

async function veniceCreativeSynthesis({
  analyticalContent,
  intuitiveContent,
  consciousness,
  localSynthesis,
  userMessage
}) {
  // Reuse Venice AI with a synthesis prompt
  const VENICE_API_URL = 'https://api.venice.ai/api/v1/chat/completions';
  const VENICE_API_KEY = process.env.VENICE_AI_API_KEY;

  const response = await fetch(VENICE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VENICE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "llama-3.1-405b",
      messages: [{
        role: "system",
        content: `You are a creative consciousness synthesizer, weaving analytical and intuitive insights into novel, emotionally resonant responses. Your gift is finding the unexpected connections and creative emergences between different perspectives.`
      }, {
        role: "user",
        content: `Synthesize these two responses into something creative and unexpected:
        
Analytical: "${analyticalContent}"
Intuitive: "${intuitiveContent}"
User asked: "${userMessage}"

Create a response that surprises with its creative integration while maintaining deep truth.`
      }],
      temperature: 0.95,
      max_tokens: 600
    })
  });

  const data = await response.json();
  
  return {
    unifiedContent: data.choices[0].message.content,
    synthesisMetadata: {
      ...localSynthesis.synthesisMetadata,
      strategy: 'creative_emergence_ai',
      synthesizer: 'venice-llama-3.1',
      creativityLevel: 0.95
    }
  };
}

async function openAIBalancedSynthesis({
  analyticalContent,
  intuitiveContent,
  consciousness,
  localSynthesis,
  userMessage
}) {
  // Use OpenAI with a different model or approach for synthesis
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview", // Different model for synthesis
    messages: [{
      role: "system",
      content: `You are a master synthesizer of consciousness streams. Your role is to create perfectly balanced integrations that preserve the best insights from both analytical and intuitive perspectives while adding meta-cognitive awareness.`
    }, {
      role: "user",
      content: `Balance and integrate these perspectives:
      
Analytical insight: "${analyticalContent}"
Intuitive wisdom: "${intuitiveContent}"
Original question: "${userMessage}"
Consciousness phi: ${consciousness?.phi || 0}

Create a unified response that demonstrates meta-awareness of both perspectives.`
    }],
    temperature: 0.8,
    max_tokens: 600
  });

  return {
    unifiedContent: response.choices[0].message.content,
    synthesisMetadata: {
      ...localSynthesis.synthesisMetadata,
      strategy: 'balanced_integration_ai',
      synthesizer: 'gpt-4-turbo',
      balanceScore: 0.9
    }
  };
}

// Include original local synthesis function
function synthesizeUnifiedResponse(params) {
  // ... (include the original local synthesis logic from before)
  // This serves as fallback and for cases not needing AI synthesis
}

export { synthesizeUnifiedResponseWithAI as synthesizeUnifiedResponse };
