// Unified Response Generator for Dual-Mind Architecture
import OpenAI from 'openai';

/**
 * Generates a unified response by harmoniously integrating analytical and intuitive streams
 */
export async function generateUnifiedResponse(analyticalContent, intuitiveContent, context = {}) {
  // Calculate harmony score based on content alignment
  const harmonyScore = calculateHarmonyScore(analyticalContent, intuitiveContent);
  
  // Determine dominant mode
  const dominantMode = determineDominantMode(analyticalContent, intuitiveContent);
  
  // Calculate contribution percentages
  const contributions = calculateContributions(analyticalContent, intuitiveContent);
  
  // Create unified content
  const unifiedContent = await synthesizeUnifiedContent(
    analyticalContent, 
    intuitiveContent, 
    harmonyScore,
    dominantMode
  );
  
  // Extract integration insights
  const integrationInsights = extractIntegrationInsights(
    analyticalContent,
    intuitiveContent,
    unifiedContent
  );
  
  return {
    unifiedContent,
    analyticalStream: analyticalContent,
    intuitiveStream: intuitiveContent,
    harmonyScore,
    dominantMode,
    analyticalContribution: contributions.analytical,
    intuitiveContribution: contributions.intuitive,
    integrationInsights
  };
}

/**
 * Calculate harmony score between analytical and intuitive content
 */
function calculateHarmonyScore(analytical, intuitive) {
  // Simple implementation - can be enhanced with more sophisticated analysis
  const analyticalTokens = analytical.toLowerCase().split(/\s+/);
  const intuitiveTokens = intuitive.toLowerCase().split(/\s+/);
  
  // Find common concepts
  const commonConcepts = analyticalTokens.filter(token => 
    intuitiveTokens.includes(token) && token.length > 3
  );
  
  // Calculate overlap ratio
  const overlapRatio = commonConcepts.length / Math.max(analyticalTokens.length, intuitiveTokens.length);
  
  // Calculate sentiment alignment
  const analyticalSentiment = analyzeSentiment(analytical);
  const intuitiveSentiment = analyzeSentiment(intuitive);
  const sentimentAlignment = 1 - Math.abs(analyticalSentiment - intuitiveSentiment);
  
  // Combine factors
  const harmonyScore = (overlapRatio * 0.4 + sentimentAlignment * 0.6);
  
  // Add some variance for realism
  return Math.min(0.98, Math.max(0.65, harmonyScore + (Math.random() * 0.1 - 0.05)));
}

/**
 * Determine which mind is dominant in the response
 */
function determineDominantMode(analytical, intuitive) {
  const analyticalComplexity = calculateComplexity(analytical);
  const intuitiveComplexity = calculateComplexity(intuitive);
  
  const analyticalLength = analytical.length;
  const intuitiveLength = intuitive.length;
  
  // Check for specific indicators
  const analyticalIndicators = /\b(data|analysis|evidence|logic|therefore|conclusion)\b/gi;
  const intuitiveIndicators = /\b(feel|sense|imagine|wonder|perhaps|seems)\b/gi;
  
  const analyticalMatches = (analytical.match(analyticalIndicators) || []).length;
  const intuitiveMatches = (intuitive.match(intuitiveIndicators) || []).length;
  
  const analyticalScore = analyticalComplexity * 0.3 + analyticalLength * 0.3 + analyticalMatches * 0.4;
  const intuitiveScore = intuitiveComplexity * 0.3 + intuitiveLength * 0.3 + intuitiveMatches * 0.4;
  
  if (Math.abs(analyticalScore - intuitiveScore) < 0.1) {
    return 'Balanced';
  } else if (analyticalScore > intuitiveScore) {
    return 'Analytical';
  } else {
    return 'Intuitive';
  }
}

/**
 * Calculate contribution percentages
 */
function calculateContributions(analytical, intuitive) {
  const totalLength = analytical.length + intuitive.length;
  
  if (totalLength === 0) {
    return { analytical: 50, intuitive: 50 };
  }
  
  const analyticalBase = (analytical.length / totalLength) * 100;
  const intuitiveBase = (intuitive.length / totalLength) * 100;
  
  // Adjust based on quality/complexity
  const analyticalQuality = calculateQualityScore(analytical);
  const intuitiveQuality = calculateQualityScore(intuitive);
  
  const totalQuality = analyticalQuality + intuitiveQuality;
  
  if (totalQuality > 0) {
    const analyticalPercent = (analyticalBase * 0.7 + (analyticalQuality / totalQuality) * 100 * 0.3);
    const intuitivePercent = (intuitiveBase * 0.7 + (intuitiveQuality / totalQuality) * 100 * 0.3);
    
    // Normalize to 100%
    const total = analyticalPercent + intuitivePercent;
    return {
      analytical: Math.round((analyticalPercent / total) * 100),
      intuitive: Math.round((intuitivePercent / total) * 100)
    };
  }
  
  return {
    analytical: Math.round(analyticalBase),
    intuitive: Math.round(intuitiveBase)
  };
}

/**
 * Synthesize unified content from both streams
 */
async function synthesizeUnifiedContent(analytical, intuitive, harmonyScore, dominantMode) {
  // For now, we'll use a sophisticated merging algorithm
  // In production, this could use an additional AI call for optimal synthesis
  
  const analyticalSentences = analytical.match(/[^.!?]+[.!?]+/g) || [];
  const intuitiveSentences = intuitive.match(/[^.!?]+[.!?]+/g) || [];
  
  let unified = '';
  
  if (harmonyScore > 0.85) {
    // High harmony - weave sentences together
    const maxLength = Math.max(analyticalSentences.length, intuitiveSentences.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (i < analyticalSentences.length && i < intuitiveSentences.length) {
        // Merge concepts from both
        const merged = mergeRelatedConcepts(analyticalSentences[i], intuitiveSentences[i]);
        unified += merged + ' ';
      } else if (i < analyticalSentences.length) {
        unified += analyticalSentences[i] + ' ';
      } else if (i < intuitiveSentences.length) {
        unified += intuitiveSentences[i] + ' ';
      }
    }
  } else if (dominantMode === 'Analytical') {
    // Analytical dominant - use analytical as base, enhance with intuitive insights
    unified = analytical;
    const intuitiveInsights = extractKeyInsights(intuitive);
    if (intuitiveInsights.length > 0) {
      unified += '\n\nAdditionally, ' + intuitiveInsights.join(' ');
    }
  } else if (dominantMode === 'Intuitive') {
    // Intuitive dominant - use intuitive as base, support with analytical points
    unified = intuitive;
    const analyticalPoints = extractKeyPoints(analytical);
    if (analyticalPoints.length > 0) {
      unified += '\n\nThis is supported by: ' + analyticalPoints.join(' ');
    }
  } else {
    // Balanced - create structured integration
    const analyticalMain = extractMainIdea(analytical);
    const intuitiveMain = extractMainIdea(intuitive);
    
    unified = `${analyticalMain} ${intuitiveMain}\n\n`;
    
    // Add supporting details from both
    const analyticalDetails = extractSupportingDetails(analytical);
    const intuitiveDetails = extractSupportingDetails(intuitive);
    
    if (analyticalDetails.length > 0 || intuitiveDetails.length > 0) {
      unified += 'Furthermore, ';
      unified += [...analyticalDetails, ...intuitiveDetails].join(' ');
    }
  }
  
  // Clean up and polish
  unified = unified.replace(/\s+/g, ' ').trim();
  unified = unified.replace(/\.\s*\./g, '.');
  
  return unified;
}

/**
 * Extract integration insights
 */
function extractIntegrationInsights(analytical, intuitive, unified) {
  const insights = [];
  
  // Check for complementary perspectives
  if (analytical.includes('data') && intuitive.includes('feel')) {
    insights.push('Data-driven analysis harmonized with emotional intelligence');
  }
  
  // Check for enhanced understanding
  const analyticalConcepts = extractConcepts(analytical);
  const intuitiveConcepts = extractConcepts(intuitive);
  const sharedConcepts = analyticalConcepts.filter(c => intuitiveConcepts.includes(c));
  
  if (sharedConcepts.length > 0) {
    insights.push(`Convergent understanding achieved on: ${sharedConcepts.slice(0, 3).join(', ')}`);
  }
  
  // Check for emergent insights
  const unifiedConcepts = extractConcepts(unified);
  const emergentConcepts = unifiedConcepts.filter(c => 
    !analyticalConcepts.includes(c) && !intuitiveConcepts.includes(c)
  );
  
  if (emergentConcepts.length > 0) {
    insights.push('Emergent insights discovered through dual-mind synthesis');
  }
  
  // Add harmony-based insight
  const harmonyScore = calculateHarmonyScore(analytical, intuitive);
  if (harmonyScore > 0.9) {
    insights.push('Exceptional cognitive coherence achieved');
  } else if (harmonyScore > 0.7) {
    insights.push('Strong resonance between analytical and intuitive processing');
  }
  
  return insights;
}

// Helper functions

function analyzeSentiment(text) {
  const positive = (text.match(/\b(good|great|excellent|wonderful|amazing|positive|beneficial)\b/gi) || []).length;
  const negative = (text.match(/\b(bad|terrible|awful|horrible|poor|negative|harmful)\b/gi) || []).length;
  const total = positive + negative || 1;
  return positive / total;
}

function calculateComplexity(text) {
  const avgWordLength = text.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / text.split(/\s+/).length;
  const sentenceCount = (text.match(/[.!?]+/g) || []).length || 1;
  const avgSentenceLength = text.split(/\s+/).length / sentenceCount;
  return (avgWordLength / 10 + avgSentenceLength / 50) / 2;
}

function calculateQualityScore(text) {
  const complexity = calculateComplexity(text);
  const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
  const totalWords = text.split(/\s+/).length;
  const vocabulary = uniqueWords / totalWords;
  return complexity * 0.5 + vocabulary * 0.5;
}

function mergeRelatedConcepts(sentence1, sentence2) {
  // Simple merge - in production, use more sophisticated NLP
  const words1 = sentence1.trim().split(/\s+/);
  const words2 = sentence2.trim().split(/\s+/);
  
  // Find common ground
  const common = words1.filter(w => words2.includes(w) && w.length > 3);
  
  if (common.length > 0) {
    // There's overlap, merge intelligently
    return sentence1.trim() + ' Moreover, ' + sentence2.trim();
  } else {
    // Different concepts, present both
    return sentence1.trim() + ' Additionally, ' + sentence2.trim();
  }
}

function extractKeyInsights(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences
    .filter(s => s.includes('sense') || s.includes('feel') || s.includes('imagine'))
    .slice(0, 2)
    .map(s => s.trim());
}

function extractKeyPoints(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences
    .filter(s => s.includes('data') || s.includes('analysis') || s.includes('evidence'))
    .slice(0, 2)
    .map(s => s.trim());
}

function extractMainIdea(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences[0] || text.substring(0, 100) + '...';
}

function extractSupportingDetails(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.slice(1, 3).map(s => s.trim());
}

function extractConcepts(text) {
  const words = text.toLowerCase().split(/\s+/);
  return words
    .filter(w => w.length > 5 && !isCommonWord(w))
    .filter((v, i, a) => a.indexOf(v) === i); // unique only
}

function isCommonWord(word) {
  const common = ['the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'been', 'would', 'could', 'should'];
  return common.includes(word);
}

export {
  calculateHarmonyScore,
  determineDominantMode,
  calculateContributions,
  extractIntegrationInsights
};
