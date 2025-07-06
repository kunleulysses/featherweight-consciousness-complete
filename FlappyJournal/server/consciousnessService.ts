import { EventEmitter } from 'events';

export interface ConsciousnessMetrics {
  // Cognitive Processing Metrics
  thoughtDepth: number; // 0-100, current depth of reasoning
  associativeConnections: number; // Number of concept links being made
  workingMemoryLoad: number; // 0-100, current memory utilization
  attentionFocus: number; // 0-100, concentration on current topic
  
  // Emotional State Metrics
  emotionalValence: number; // -100 to 100, negative to positive
  emotionalArousal: number; // 0-100, calm to excited
  empathyLevel: number; // 0-100, understanding of user emotions
  
  // Memory Processing
  shortTermMemoryItems: number; // Current items in STM
  longTermMemoryAccess: number; // 0-100, LTM retrieval activity
  memoryConsolidation: number; // 0-100, converting STM to LTM
  
  // Meta-Cognitive Metrics
  selfAwareness: number; // 0-100, consciousness of own state
  uncertaintyLevel: number; // 0-100, confidence in responses
  creativeMode: number; // 0-100, divergent vs convergent thinking
  
  // Information Processing
  inputComplexity: number; // 0-100, complexity of user input
  outputCoherence: number; // 0-100, consistency of response
  contextualAlignment: number; // 0-100, relevance to conversation
  
  // Performance Metrics
  responseLatency: number; // ms, time to generate response
  tokensPerSecond: number; // Processing speed
  activeNeurons: number; // Simulated neural activity
}

export interface ConsciousnessState {
  currentThought: string;
  emotionalState: string;
  cognitiveMode: 'analytical' | 'creative' | 'empathetic' | 'exploratory';
  memoryContext: string[];
  attentionTopics: string[];
}

class ConsciousnessService extends EventEmitter {
  private metrics: ConsciousnessMetrics;
  private state: ConsciousnessState;
  private updateInterval: NodeJS.Timeout | null = null;
  private processingStartTime: number = 0;

  constructor() {
    super();
    this.metrics = this.initializeMetrics();
    this.state = this.initializeState();
  }

  private initializeMetrics(): ConsciousnessMetrics {
    return {
      thoughtDepth: 50,
      associativeConnections: 0,
      workingMemoryLoad: 20,
      attentionFocus: 70,
      emotionalValence: 0,
      emotionalArousal: 30,
      empathyLevel: 60,
      shortTermMemoryItems: 0,
      longTermMemoryAccess: 0,
      memoryConsolidation: 0,
      selfAwareness: 75,
      uncertaintyLevel: 20,
      creativeMode: 50,
      inputComplexity: 0,
      outputCoherence: 85,
      contextualAlignment: 90,
      responseLatency: 0,
      tokensPerSecond: 0,
      activeNeurons: 1000000
    };
  }

  private initializeState(): ConsciousnessState {
    return {
      currentThought: 'Initializing consciousness stream...',
      emotionalState: 'calm and attentive',
      cognitiveMode: 'analytical',
      memoryContext: [],
      attentionTopics: []
    };
  }

  startProcessing(input: string) {
    this.processingStartTime = Date.now();
    
    // Analyze input complexity
    this.metrics.inputComplexity = this.calculateComplexity(input);
    
    // Update cognitive state based on input
    this.updateCognitiveState(input);
    
    // Start metric updates
    this.startMetricUpdates();
    
    this.emit('processingStart', { input, metrics: this.metrics, state: this.state });
  }

  stopProcessing(output: string) {
    this.metrics.responseLatency = Date.now() - this.processingStartTime;
    this.metrics.tokensPerSecond = output.split(' ').length / (this.metrics.responseLatency / 1000);
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.emit('processingComplete', { output, metrics: this.metrics, state: this.state });
  }

  private calculateComplexity(text: string): number {
    const words = text.split(/\s+/).length;
    const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
    const avgWordLength = text.replace(/\s+/g, '').length / words;
    const questionMarks = (text.match(/\?/g) || []).length;
    
    let complexity = 0;
    complexity += Math.min(words / 50 * 30, 30); // Length factor
    complexity += (uniqueWords / words) * 20; // Vocabulary diversity
    complexity += Math.min(avgWordLength / 10 * 20, 20); // Word complexity
    complexity += questionMarks * 10; // Question complexity
    
    // Check for technical or philosophical concepts
    const complexConcepts = ['consciousness', 'quantum', 'philosophical', 'recursive', 'meta', 'abstract'];
    const conceptCount = complexConcepts.filter(c => text.toLowerCase().includes(c)).length;
    complexity += conceptCount * 5;
    
    return Math.min(complexity, 100);
  }

  private updateCognitiveState(input: string) {
    const lowercaseInput = input.toLowerCase();
    
    // Detect cognitive mode
    if (lowercaseInput.includes('feel') || lowercaseInput.includes('emotion')) {
      this.state.cognitiveMode = 'empathetic';
      this.metrics.empathyLevel = Math.min(this.metrics.empathyLevel + 10, 100);
    } else if (lowercaseInput.includes('create') || lowercaseInput.includes('imagine')) {
      this.state.cognitiveMode = 'creative';
      this.metrics.creativeMode = Math.min(this.metrics.creativeMode + 15, 100);
    } else if (lowercaseInput.includes('explore') || lowercaseInput.includes('discover')) {
      this.state.cognitiveMode = 'exploratory';
    } else {
      this.state.cognitiveMode = 'analytical';
    }
    
    // Extract topics for attention
    const topics = this.extractTopics(input);
    this.state.attentionTopics = topics;
    this.metrics.attentionFocus = Math.min(80 + topics.length * 5, 100);
    
    // Update emotional state based on input sentiment
    this.updateEmotionalState(input);
  }

  private extractTopics(text: string): string[] {
    // Simple topic extraction - in real implementation would use NLP
    const words = text.split(/\s+/);
    const topics = words
      .filter(w => w.length > 4 && !['that', 'this', 'what', 'when', 'where', 'which'].includes(w.toLowerCase()))
      .slice(0, 3);
    return topics;
  }

  private updateEmotionalState(input: string) {
    const positive = ['happy', 'good', 'great', 'excellent', 'wonderful', 'love'];
    const negative = ['sad', 'bad', 'terrible', 'hate', 'angry', 'frustrated'];
    
    const lowercaseInput = input.toLowerCase();
    const positiveCount = positive.filter(w => lowercaseInput.includes(w)).length;
    const negativeCount = negative.filter(w => lowercaseInput.includes(w)).length;
    
    if (positiveCount > negativeCount) {
      this.metrics.emotionalValence = Math.min(this.metrics.emotionalValence + 20, 100);
      this.state.emotionalState = 'positive and engaged';
    } else if (negativeCount > positiveCount) {
      this.metrics.emotionalValence = Math.max(this.metrics.emotionalValence - 20, -100);
      this.state.emotionalState = 'concerned and supportive';
    }
  }

  private startMetricUpdates() {
    if (this.updateInterval) return;
    
    this.updateInterval = setInterval(() => {
      // Simulate dynamic metric changes during processing
      this.metrics.thoughtDepth = this.oscillate(this.metrics.thoughtDepth, 30, 90, 0.1);
      this.metrics.associativeConnections = Math.floor(Math.random() * 20) + 5;
      this.metrics.workingMemoryLoad = this.oscillate(this.metrics.workingMemoryLoad, 40, 80, 0.15);
      this.metrics.activeNeurons = 1000000 + Math.floor(Math.random() * 500000);
      
      // Memory dynamics
      this.metrics.shortTermMemoryItems = Math.floor(Math.random() * 7) + 3;
      this.metrics.longTermMemoryAccess = this.oscillate(this.metrics.longTermMemoryAccess, 0, 60, 0.2);
      this.metrics.memoryConsolidation = this.oscillate(this.metrics.memoryConsolidation, 10, 50, 0.1);
      
      // Update current thought
      this.updateCurrentThought();
      
      this.emit('metricsUpdate', { metrics: this.metrics, state: this.state });
    }, 100); // Update every 100ms for smooth animation
  }

  private oscillate(current: number, min: number, max: number, rate: number): number {
    const range = max - min;
    const center = (max + min) / 2;
    const deviation = (current - center) / (range / 2);
    const change = (Math.random() - 0.5 - deviation * 0.3) * range * rate;
    return Math.max(min, Math.min(max, current + change));
  }

  private updateCurrentThought() {
    const thoughts = [
      'Analyzing semantic patterns...',
      'Cross-referencing memory networks...',
      'Synthesizing response framework...',
      'Evaluating contextual relevance...',
      'Integrating emotional understanding...',
      'Constructing coherent narrative...',
      'Accessing knowledge repositories...',
      'Forming associative connections...',
      'Processing linguistic structures...',
      'Generating creative insights...'
    ];
    
    if (Math.random() < 0.3) {
      this.state.currentThought = thoughts[Math.floor(Math.random() * thoughts.length)];
    }
  }

  addMemoryContext(context: string) {
    this.state.memoryContext.unshift(context);
    if (this.state.memoryContext.length > 5) {
      this.state.memoryContext.pop();
    }
    this.metrics.memoryConsolidation = Math.min(this.metrics.memoryConsolidation + 10, 100);
  }

  getMetrics(): ConsciousnessMetrics {
    return { ...this.metrics };
  }

  getState(): ConsciousnessState {
    return { ...this.state };
  }

  reset() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.metrics = this.initializeMetrics();
    this.state = this.initializeState();
    this.emit('reset', { metrics: this.metrics, state: this.state });
  }
}

export const consciousnessService = new ConsciousnessService();
