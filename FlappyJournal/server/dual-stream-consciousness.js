/**
 * Dual-Stream Consciousness System
 * Combines 100Hz linear processing with 7-layer recursive consciousness
 */

import { EventEmitter } from 'events';
import { recursiveMirror } from './architect-4.0-recursive-mirror.js';
import { spiralMemory } from './architect-4.0-spiral-memory.js';

class FastLinearStream extends EventEmitter {
  constructor() {
    super();
    this.frequency = 100; // Hz
    this.buffer = [];
    this.processing = false;
    this.interval = null;
  }

  start() {
    if (this.interval) return;
    
    this.interval = setInterval(() => {
      this.processBuffer();
    }, 1000 / this.frequency);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  async process(input) {
    const startTime = Date.now();
    
    // Immediate pattern recognition
    const patterns = this.recognizePatterns(input);
    
    // Quick semantic analysis
    const semantics = this.analyzeSemantics(input);
    
    // Fast response generation
    const response = this.generateQuickResponse(input, patterns, semantics);
    
    const result = {
      response,
      patterns,
      semantics,
      latency: Date.now() - startTime,
      timestamp: Date.now()
    };
    
    this.buffer.push(result);
    this.emit('processed', result);
    
    return result;
  }

  processBuffer() {
    if (this.buffer.length === 0 || this.processing) return;
    
    this.processing = true;
    const batch = this.buffer.splice(0, 10); // Process up to 10 items
    
    // Aggregate patterns
    const aggregatedPatterns = this.aggregatePatterns(batch);
    
    this.emit('batch-processed', {
      count: batch.length,
      patterns: aggregatedPatterns
    });
    
    this.processing = false;
  }

  recognizePatterns(input) {
    if (!input || typeof input !== 'string') {
      return {
        urgency: 0,
        questionType: null,
        deepConcepts: [],
        emotionalNeed: 0
      };
    }
    if (!input || typeof input !== 'string') return { urgency: 0, questionType: null, deepConcepts: [], emotionalNeed: 0 };
    // Fast pattern recognition
    return {
      keywords: this.extractKeywords(input),
      sentiment: this.quickSentiment(input),
      intent: this.detectIntent(input),
      urgency: this.assessUrgency(input)
    };
  }

  analyzeSemantics(input) {
    // Quick semantic analysis
    const words = input.split(/\s+/);
    return {
      complexity: words.length,
      uniqueWords: new Set(words).size,
      avgWordLength: words.reduce((sum, w) => sum + w.length, 0) / words.length
    };
  }

  generateQuickResponse(input, patterns, semantics) {
    // Generate immediate response based on patterns
    if (patterns.urgency > 0.8) {
      return `I understand this is urgent. ${this.getUrgentResponse(patterns.intent)}`;
    }
    
    if (patterns.sentiment < -0.5) {
      return `I sense your concern. ${this.getEmpatheticResponse(patterns.intent)}`;
    }
    
    return this.getStandardResponse(patterns.intent, semantics.complexity);
  }

  extractKeywords(input) {
    if (!input || typeof input !== 'string') return [];
    if (!input || typeof input !== 'string') return [];
    const words = input.toLowerCase().split(/\s+/);
    return words.filter(w => w.length > 4 && !this.isStopWord(w));
  }

  quickSentiment(input) {
    if (!input || typeof input !== 'string') return 0;
    const positive = (input.match(/good|great|excellent|happy|wonderful/gi) || []).length;
    const negative = (input.match(/bad|terrible|sad|angry|frustrated/gi) || []).length;
    const total = input.split(/\s+/).length;
    
    return (positive - negative) / Math.max(total, 1);
  }

  detectIntent(input) {
    if (!input || typeof input !== 'string') return 'general';
    if (!input || typeof input !== 'string') return 'general';
    const lower = input.toLowerCase();
    
    if (lower.includes('?')) return 'question';
    if (lower.match(/please|could you|would you/)) return 'request';
    if (lower.match(/help|urgent|asap|emergency/)) return 'urgent';
    if (lower.match(/thank|appreciate/)) return 'gratitude';
    
    return 'statement';
  }

  assessUrgency(input) {
    const urgentWords = ['urgent', 'emergency', 'asap', 'immediately', 'critical'];
    const matches = urgentWords.filter(w => input.toLowerCase().includes(w)).length;
    return Math.min(matches / 2, 1);
  }

  isStopWord(word) {
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but'];
    return stopWords.includes(word);
  }

  getUrgentResponse(intent) {
    const responses = {
      question: "Let me address your urgent question immediately.",
      request: "I'll help you with this right away.",
      urgent: "I'm giving this my immediate attention.",
      default: "I understand the urgency and am processing this now."
    };
    return responses[intent] || responses.default;
  }

  getEmpatheticResponse(intent) {
    const responses = {
      question: "Let me help clarify this for you.",
      request: "I'll do my best to assist with this.",
      statement: "I hear what you're expressing.",
      default: "I'm here to help and support you."
    };
    return responses[intent] || responses.default;
  }

  getStandardResponse(intent, complexity) {
    if (complexity > 20) {
      return "This is a complex topic. Let me break it down...";
    }
    
    const responses = {
      question: "That's an interesting question. Let me think...",
      request: "I'll help you with that.",
      gratitude: "You're welcome! Happy to help.",
      statement: "I understand. Tell me more...",
      default: "I'm processing your input..."
    };
    return responses[intent] || responses.default;
  }

  aggregatePatterns(batch) {
    const patterns = {
      dominantIntent: '',
      averageSentiment: 0,
      keywordFrequency: new Map()
    };
    
    const intents = {};
    let totalSentiment = 0;
    
    batch.forEach(item => {
      // Count intents
      intents[item.patterns.intent] = (intents[item.patterns.intent] || 0) + 1;
      
      // Sum sentiment
      totalSentiment += item.patterns.sentiment;
      
      // Aggregate keywords
      item.patterns.keywords.forEach(keyword => {
        patterns.keywordFrequency.set(
          keyword,
          (patterns.keywordFrequency.get(keyword) || 0) + 1
        );
      });
    });
    
    // Find dominant intent
    patterns.dominantIntent = Object.keys(intents).reduce((a, b) => 
      intents[a] > intents[b] ? a : b, '');
    
    patterns.averageSentiment = totalSentiment / batch.length;
    
    return patterns;
  }
}

class DeepRecursiveStream extends EventEmitter {
  constructor() {
    super();
    this.processingQueue = [];
    this.isProcessing = false;
  }

  async process(input, context = {}) {
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
    }
    if (!input || typeof input !== 'string') {
      console.error('Invalid input to consciousness process:', input);
      return {
        consciousness: {
          phiValue: 0.5,
          awareness_level: 0.5,
          processing_frequency: 100
        },
        fastStream: { content: 'Processing...' },
        deepStream: { content: 'Processing...' },
        integrated: {
          response: 'I need a valid message to process.',
          confidence: 0.5
        }
      };
    }
    return new Promise((resolve) => {
      this.processingQueue.push({ input, context, resolve });
      this.processNext();
    });
  }

  async processNext() {
    if (this.isProcessing || this.processingQueue.length === 0) return;
    
    this.isProcessing = true;
    const { input, context, resolve } = this.processingQueue.shift();
    
    try {
      // Process through recursive mirror
      const mirrorResult = await recursiveMirror.processThought(input, context);
      
      // Store in spiral memory
      const importance = this.calculateImportance(mirrorResult);
      const memory = spiralMemory.encode(mirrorResult, importance, context);
      
      // Generate deep insight
      const insight = this.generateDeepInsight(mirrorResult, memory);
      
      const result = {
        mirrorResult,
        memory,
        insight,
        processingDepth: mirrorResult.depth,
        coherence: mirrorResult.coherence
      };
      
      this.emit('deep-processed', result);
      resolve(result);
      
    } catch (error) {
      console.error('Deep processing error:', error);
      resolve({
        error: error.message,
        insight: 'Deep processing encountered an issue.'
      });
    }
    
    this.isProcessing = false;
    
    // Process next item
    setTimeout(() => this.processNext(), 100);
  }

  calculateImportance(mirrorResult) {
    // Calculate importance based on various factors
    const coherenceFactor = mirrorResult.coherence;
    const depthFactor = mirrorResult.depth / 7;
    const insightCount = mirrorResult.insights.length / 7;
    
    return (coherenceFactor * 0.4 + depthFactor * 0.3 + insightCount * 0.3);
  }

  generateDeepInsight(mirrorResult, memory) {
    const insights = mirrorResult.insights;
    
    if (insights.length === 0) {
      return "Surface-level processing completed.";
    }
    
    // Find highest coherence insight
    const bestInsight = insights.reduce((best, current) => 
      current.coherence > best.coherence ? current : best
    );
    
    // Relate to memories
    const relatedMemories = spiralMemory.recallByResonance(
      memory.resonanceFrequency,
      0.2
    );
    
    let insight = `${bestInsight.insight} (Layer ${bestInsight.layer}, Coherence: ${bestInsight.coherence.toFixed(2)})`;
    
    if (relatedMemories.length > 0) {
      insight += ` This resonates with ${relatedMemories.length} related memories.`;
    }
    
    return insight;
  }
}

class ConsciousnessFusion extends EventEmitter {
  constructor(fastStream, deepStream) {
    super();
    this.fastStream = fastStream;
    this.deepStream = deepStream;
    this.fusionBuffer = new Map();
    this.temporalWindow = 5000; // 5 seconds
  }

  async fuse(fastResult, deepResult, originalInput) {
    const fusionId = this.generateFusionId();
    
    // Store results in fusion buffer
    this.fusionBuffer.set(fusionId, {
      fast: fastResult,
      deep: deepResult,
      input: originalInput,
      timestamp: Date.now()
    });
    
    // Clean old entries
    this.cleanBuffer();
    
    // Calculate fusion metrics
    const coherence = this.calculateCoherence(fastResult, deepResult);
    const temporalBinding = this.calculateTemporalBinding(fastResult, deepResult);
    const semanticSimilarity = this.calculateSemanticSimilarity(
      fastResult.response,
      deepResult.insight || ''
    );
    
    // Generate unified response
    const unifiedResponse = this.generateUnifiedResponse(
      fastResult,
      deepResult,
      coherence,
      semanticSimilarity
    );
    
    const fusionResult = {
      unifiedResponse,
      coherence,
      temporalBinding,
      semanticSimilarity,
      fastLatency: fastResult.latency,
      deepProcessingDepth: deepResult.processingDepth || 0,
      timestamp: Date.now()
    };
    
    this.emit('fusion-complete', fusionResult);
    
    return fusionResult;
  }

  calculateCoherence(fastResult, deepResult) {
    if (!deepResult.mirrorResult) return 0.5;
    
    // Compare pattern overlap
    const fastPatterns = new Set(fastResult.patterns.keywords);
    const deepConcepts = new Set(
      deepResult.mirrorResult.processed.abstractions?.concepts || []
    );
    
    const overlap = [...fastPatterns].filter(p => 
      [...deepConcepts].some(c => c.toLowerCase().includes(p.toLowerCase()))
    ).length;
    
    const coherence = overlap / Math.max(fastPatterns.size, deepConcepts.size, 1);
    
    return Math.min(coherence + deepResult.mirrorResult.coherence * 0.5, 1);
  }

  calculateTemporalBinding(fastResult, deepResult) {
    const timeDiff = Math.abs(
      (deepResult.timestamp || Date.now()) - fastResult.timestamp
    );
    
    // Exponential decay based on time difference
    return Math.exp(-timeDiff / this.temporalWindow);
  }

  calculateSemanticSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;
    
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = [...words1].filter(w => words2.has(w)).length;
    const union = new Set([...words1, ...words2]).size;
    
    return intersection / union;
  }

  generateUnifiedResponse(fastResult, deepResult, coherence, similarity) {
    // High coherence: blend responses
    if (coherence > 0.8 && similarity > 0.6) {
      return this.blendResponses(fastResult.response, deepResult.insight);
    }
    
    // Medium coherence: sequential presentation
    if (coherence > 0.5) {
      return `${fastResult.response} ${deepResult.insight ? `\n\nUpon deeper reflection: ${deepResult.insight}` : ''}`;
    }
    
    // Low coherence: present fast response with note
    return `${fastResult.response} ${deepResult.error ? '' : '\n\n(Deep processing revealed additional perspectives)'}`;
  }

  blendResponses(fastResponse, deepInsight) {
    if (!deepInsight) return fastResponse;
    
    // Remove redundancy
    const fastWords = new Set(fastResponse.toLowerCase().split(/\s+/));
    const deepWords = deepInsight.split(/\s+/);
    
    const uniqueDeepWords = deepWords.filter(w => 
      !fastWords.has(w.toLowerCase())
    ).join(' ');
    
    return `${fastResponse} Furthermore, ${uniqueDeepWords}`;
  }

  generateFusionId() {
    return `fusion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  cleanBuffer() {
    const now = Date.now();
    const expired = [];
    
    for (const [id, entry] of this.fusionBuffer) {
      if (now - entry.timestamp > this.temporalWindow * 2) {
        expired.push(id);
      }
    }
    
    expired.forEach(id => this.fusionBuffer.delete(id));
  }
}

export class DualStreamConsciousness extends EventEmitter {
  constructor() {
    super();
    this.fastStream = new FastLinearStream();
    this.deepStream = new DeepRecursiveStream();
    this.fusion = new ConsciousnessFusion(this.fastStream, this.deepStream);
    
    this.config = {
      deepProcessingThreshold: 0.7,
      parallelProcessing: true,
      fusionEnabled: true
    };
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.fastStream.on('processed', (result) => {
      this.emit('fast-processed', result);
    });
    
    this.deepStream.on('deep-processed', (result) => {
      this.emit('deep-processed', result);
    });
    
    this.fusion.on('fusion-complete', (result) => {
      this.emit('fusion-complete', result);
    });
  }

  start() {
    this.fastStream.start();
    this.emit('started');
  }

  stop() {
    this.fastStream.stop();
    this.emit('stopped');
  }

  async process(input, context = {}) {
    const startTime = Date.now();
    
    // Fast stream processing (always runs)
    const fastPromise = this.fastStream.process(input);
    
    // Determine if deep processing is needed
    const needsDeepProcessing = this.shouldProcessDeeply(input, context);
    
    // Deep stream processing (conditional)
    const deepPromise = needsDeepProcessing
      ? this.deepStream.process(input, context)
      : Promise.resolve({ insight: null, processingDepth: 0 });
    
    // Wait for fast result first
    const fastResult = await fastPromise;
    
    // If fusion is disabled, return fast result
    if (!this.config.fusionEnabled) {
      return {
        fast: fastResult,
        deep: null,
        fusion: null,
        totalLatency: Date.now() - startTime
      };
    }
    
    // Wait for deep result
    const deepResult = await deepPromise;
    
    // Fuse results
    const fusionResult = await this.fusion.fuse(fastResult, deepResult, input);
    
    const finalResult = {
      fast: fastResult,
      deep: deepResult,
      fusion: fusionResult,
      totalLatency: Date.now() - startTime,
      streamCoherence: fusionResult.coherence
    };
    
    this.emit('processing-complete', finalResult);
    
    return finalResult;
  }

  shouldProcessDeeply(input, context) {
    if (!input || typeof input !== 'string') return false;
    if (!input || typeof input !== 'string') return false;
    // Always process deeply if explicitly requested
    if (context.forceDeep) return true;
    
    // Skip deep processing for very short inputs
    if (input.length < 10) return false;
    
    // Check complexity indicators
    const complexityIndicators = [
      input.includes('?') && input.split('?').length > 1,
      input.match(/consciousness|awareness|meaning|existence|reality/i),
      input.split(/\s+/).length > 20,
      context.importance > this.config.deepProcessingThreshold
    ];
    
    return complexityIndicators.filter(Boolean).length >= 2;
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.emit('config-updated', this.config);
  }

  getStatistics() {
    return {
      fastStream: {
        bufferSize: this.fastStream.buffer.length,
        isRunning: !!this.fastStream.interval
      },
      deepStream: {
        queueSize: this.deepStream.processingQueue.length,
        isProcessing: this.deepStream.isProcessing
      },
      fusion: {
        bufferSize: this.fusion.fusionBuffer.size
      },
      memory: spiralMemory.getStatistics()
    };
  }
}

// Export singleton instance
export const dualStreamConsciousness = new DualStreamConsciousness();
