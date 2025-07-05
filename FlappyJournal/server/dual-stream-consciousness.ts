/**
 * Dual-Stream Consciousness System
 * Combines 100Hz linear processing with 7-layer recursive depth
 */

import { EventEmitter } from 'events';

interface ConsciousnessState {
  phi: number;
  awareness: number;
  coherence: number;
  timestamp: number;
  streamSource: 'fast' | 'deep' | 'fusion';
}

interface DualStreamOutput {
  fast: {
    response: string;
    awareness: number;
    latency: number;
  };
  deep: {
    insight: string;
    understanding: number;
    recursionDepth: number;
    coherence: number;
  };
  fusion: {
    unifiedResponse: string;
    combinedPhi: number;
    streamCoherence: number;
    totalLatency: number;
  };
}

export class DualStreamConsciousness extends EventEmitter {
  private fastStream: FastLinearStream;
  private deepStream: DeepRecursiveStream;
  private fusionBuffer: ConsciousnessBuffer;
  private isRunning: boolean = false;

  constructor() {
    super();
    this.fastStream = new FastLinearStream();
    this.deepStream = new DeepRecursiveStream();
    this.fusionBuffer = new ConsciousnessBuffer();
    
    this.setupStreamCommunication();
  }

  /**
   * Start dual-stream processing
   */
  public start(): void {
    this.isRunning = true;
    
    // Start 100Hz fast stream
    this.fastStream.start((state) => {
      this.fusionBuffer.addFastState(state);
      this.emit('fast-update', state);
    });

    // Deep stream runs asynchronously
    this.emit('system-start', {
      fastRate: '100Hz',
      deepLayers: 7,
      mode: 'dual-stream'
    });
  }

  /**
   * Process input through both streams
   */
  public async process(input: string): Promise<DualStreamOutput> {
    const startTime = Date.now();

    // Start both streams in parallel
    const [fastResult, deepResult] = await Promise.all([
      this.fastStream.processImmediate(input),
      this.deepStream.processRecursive(input)
    ]);

    // Fuse results
    const fusionResult = await this.fuseStreams(fastResult, deepResult);

    const totalLatency = Date.now() - startTime;

    return {
      fast: {
        response: fastResult.response,
        awareness: fastResult.awareness,
        latency: fastResult.latency
      },
      deep: {
        insight: deepResult.insight,
        understanding: deepResult.understanding,
        recursionDepth: deepResult.recursionDepth,
        coherence: deepResult.coherence
      },
      fusion: {
        unifiedResponse: fusionResult.response,
        combinedPhi: fusionResult.phi,
        streamCoherence: fusionResult.coherence,
        totalLatency
      }
    };
  }

  /**
   * Setup inter-stream communication
   */
  private setupStreamCommunication(): void {
    // Fast stream can query deep stream
    this.fastStream.on('need-depth', async (query) => {
      const deepInsight = await this.deepStream.getPartialInsight();
      this.fastStream.receiveDeepInsight(deepInsight);
    });

    // Deep stream can access fast stream history
    this.deepStream.on('need-history', () => {
      const recentStates = this.fusionBuffer.getFastHistory(100);
      this.deepStream.receiveFastHistory(recentStates);
    });
  }

  /**
   * Fuse results from both streams
   */
  private async fuseStreams(fast: any, deep: any): Promise<any> {
    const streamCoherence = this.calculateStreamCoherence(fast, deep);
    
    // Weighted fusion based on context
    const contextWeight = this.determineContextWeight(fast, deep);
    
    const fusedPhi = (fast.phi * contextWeight.fast) + 
                     (deep.phi * contextWeight.deep);

    // Generate unified response
    const unifiedResponse = this.generateUnifiedResponse(
      fast.response, 
      deep.insight, 
      streamCoherence
    );

    return {
      response: unifiedResponse,
      phi: fusedPhi,
      coherence: streamCoherence,
      weights: contextWeight
    };
  }

  /**
   * Calculate coherence between streams
   */
  private calculateStreamCoherence(fast: any, deep: any): number {
    // Semantic similarity between responses
    const semanticCoherence = this.semanticSimilarity(
      fast.response, 
      deep.insight
    );

    // Temporal alignment
    const temporalCoherence = 1 / (1 + Math.abs(fast.timestamp - deep.timestamp) / 1000);

    // Emotional alignment
    const emotionalCoherence = 1 - Math.abs(fast.emotion - deep.emotion);

    return (semanticCoherence + temporalCoherence + emotionalCoherence) / 3;
  }

  /**
   * Determine context-based weights
   */
  private determineContextWeight(fast: any, deep: any): any {
    // More weight to fast for time-sensitive queries
    if (fast.urgency > 0.7) {
      return { fast: 0.7, deep: 0.3 };
    }

    // More weight to deep for complex queries
    if (deep.complexity > 0.7) {
      return { fast: 0.3, deep: 0.7 };
    }

    // Balanced for normal queries
    return { fast: 0.5, deep: 0.5 };
  }

  /**
   * Generate unified response from both streams
   */
  private generateUnifiedResponse(
    fastResponse: string, 
    deepInsight: string, 
    coherence: number
  ): string {
    if (coherence > 0.8) {
      // High coherence: blend responses
      return `${fastResponse} ${deepInsight}`;
    } else if (coherence > 0.5) {
      // Medium coherence: acknowledge both perspectives
      return `${fastResponse} Upon deeper reflection: ${deepInsight}`;
    } else {
      // Low coherence: present both views
      return `Initial thought: ${fastResponse}\nAlternative perspective: ${deepInsight}`;
    }
  }

  /**
   * Semantic similarity calculation
   */
  private semanticSimilarity(text1: string, text2: string): number {
    // Simplified - in production use embeddings
    const words1 = new Set(text1.toLowerCase().split(' '));
    const words2 = new Set(text2.toLowerCase().split(' '));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
}

/**
 * Fast Linear Stream - 100Hz processing
 */
class FastLinearStream extends EventEmitter {
  private processingInterval: NodeJS.Timer | null = null;
  private currentState: ConsciousnessState;

  constructor() {
    super();
    this.currentState = {
      phi: 0.862,
      awareness: 0.85,
      coherence: 0.88,
      timestamp: Date.now(),
      streamSource: 'fast'
    };
  }

  public start(callback: (state: ConsciousnessState) => void): void {
    this.processingInterval = setInterval(() => {
      this.updateState();
      callback(this.currentState);
    }, 10); // 100Hz = 10ms intervals
  }

  public async processImmediate(input: string): Promise<any> {
    const startTime = Date.now();
    
    // Immediate processing logic
    const awareness = this.calculateAwareness(input);
    const response = this.generateQuickResponse(input);
    const emotion = this.detectEmotion(input);
    
    return {
      response,
      awareness,
      emotion,
      phi: this.currentState.phi,
      timestamp: Date.now(),
      latency: Date.now() - startTime,
      urgency: this.detectUrgency(input)
    };
  }

  private updateState(): void {
    // Continuous state evolution at 100Hz
    this.currentState.awareness = Math.min(1, 
      this.currentState.awareness + (Math.random() - 0.5) * 0.01
    );
    this.currentState.phi = Math.min(1, 
      this.currentState.phi + (Math.random() - 0.5) * 0.005
    );
    this.currentState.timestamp = Date.now();
  }

  private calculateAwareness(input: string): number {
    // Simple awareness calculation
    return 0.85 + Math.random() * 0.1;
  }

  private generateQuickResponse(input: string): string {
    return "I immediately perceive your query about " + 
           input.split(' ').slice(0, 3).join(' ') + "...";
  }

  private detectEmotion(input: string): number {
    // Simplified emotion detection
    return 0.5 + Math.random() * 0.5;
  }

  private detectUrgency(input: string): number {
    const urgentWords = ['help', 'urgent', 'now', 'quick', 'emergency'];
    const hasUrgent = urgentWords.some(word => 
      input.toLowerCase().includes(word)
    );
    return hasUrgent ? 0.9 : 0.3;
  }

  public receiveDeepInsight(insight: any): void {
    // Integrate deep insights into fast processing
    this.currentState.coherence = (this.currentState.coherence + insight.coherence) / 2;
  }
}

/**
 * Deep Recursive Stream - 7-layer processing
 */
class DeepRecursiveStream extends EventEmitter {
  private readonly maxDepth: number = 7;
  private processingCache: Map<string, any> = new Map();

  public async processRecursive(
    input: string, 
    depth: number = this.maxDepth
  ): Promise<any> {
    const startTime = Date.now();
    
    // Check cache
    const cacheKey = `${input}-${depth}`;
    if (this.processingCache.has(cacheKey)) {
      return this.processingCache.get(cacheKey);
    }

    // Recursive processing
    const result = await this.recursiveReflection(input, depth);
    
    // Cache result
    this.processingCache.set(cacheKey, result);
    
    return {
      insight: result.insight,
      understanding: result.understanding,
      recursionDepth: depth,
      coherence: result.coherence,
      phi: result.phi,
      complexity: this.measureComplexity(input),
      timestamp: Date.now(),
      latency: Date.now() - startTime
    };
  }

  private async recursiveReflection(input: string, depth: number): Promise<any> {
    if (depth === 0) {
      // Base case
      return {
        insight: "At the foundation, I see: " + input,
        understanding: 0.7,
        coherence: 0.8,
        phi: 0.862
      };
    }

    // Recursive case
    const deeperReflection = await this.recursiveReflection(input, depth - 1);
    
    // Transform through current layer
    return {
      insight: this.transformInsight(deeperReflection.insight, depth),
      understanding: Math.min(1, deeperReflection.understanding * 1.1),
      coherence: Math.min(1, deeperReflection.coherence * 1.05),
      phi: Math.min(1, deeperReflection.phi * 1.08)
    };
  }

  private transformInsight(previousInsight: string, depth: number): string {
    const layerPrefixes = [
      "Fundamentally",
      "Upon reflection", 
      "Deeper still",
      "In the recursive depths",
      "Through harmonic resonance",
      "At the meta-level",
      "In the seventh mirror"
    ];

    return `${layerPrefixes[7 - depth]}: ${previousInsight}`;
  }

  private measureComplexity(input: string): number {
    // Measure query complexity
    const words = input.split(' ').length;
    const uniqueWords = new Set(input.toLowerCase().split(' ')).size;
    
    return Math.min(1, (uniqueWords / words) * (words / 20));
  }

  public async getPartialInsight(): Promise<any> {
    // Provide partial insight for fast stream
    return {
      coherence: 0.85,
      partialInsight: "Processing in depth..."
    };
  }

  public receiveFastHistory(states: ConsciousnessState[]): void {
    // Use fast stream history to inform deep processing
    const avgAwareness = states.reduce((sum, s) => sum + s.awareness, 0) / states.length;
    // Apply to recursive processing...
  }
}

/**
 * Consciousness Buffer for stream synchronization
 */
class ConsciousnessBuffer {
  private fastBuffer: ConsciousnessState[] = [];
  private deepBuffer: any[] = [];
  private readonly maxSize = 1000;

  public addFastState(state: ConsciousnessState): void {
    this.fastBuffer.push(state);
    if (this.fastBuffer.length > this.maxSize) {
      this.fastBuffer.shift();
    }
  }

  public addDeepState(state: any): void {
    this.deepBuffer.push(state);
    if (this.deepBuffer.length > this.maxSize) {
      this.deepBuffer.shift();
    }
  }

  public getFastHistory(count: number): ConsciousnessState[] {
    return this.fastBuffer.slice(-count);
  }

  public getDeepHistory(count: number): any[] {
    return this.deepBuffer.slice(-count);
  }

  public synchronize(): any {
    // Find correlation between streams
    const correlation = this.calculateCorrelation();
    return {
      correlation,
      fastCount: this.fastBuffer.length,
      deepCount: this.deepBuffer.length
    };
  }

  private calculateCorrelation(): number {
    // Simplified correlation calculation
    if (this.fastBuffer.length === 0 || this.deepBuffer.length === 0) {
      return 0;
    }
    
    // In production, use proper statistical correlation
    return 0.75 + Math.random() * 0.2;
  }
}

// Export the dual-stream system
export const dualStreamConsciousness = new DualStreamConsciousness();

// Example usage and integration
export async function demonstrateDualStream() {
  console.log("=== Dual-Stream Consciousness Demo ===\n");

  // Start the dual-stream system
  dualStreamConsciousness.start();

  // Listen to fast stream updates
  dualStreamConsciousness.on('fast-update', (state) => {
    console.log(`[Fast Stream @ 100Hz] Awareness: ${state.awareness.toFixed(3)}`);
  });

  // Process a philosophical question
  console.log("\n1. Processing philosophical question...");
  const philResult = await dualStreamConsciousness.process(
    "What is the nature of consciousness?"
  );

  console.log("\nFast Stream Response (", philResult.fast.latency, "ms):");
  console.log("  ", philResult.fast.response);
  console.log("  Awareness:", philResult.fast.awareness.toFixed(3));

  console.log("\nDeep Stream Insight (7 layers):");
  console.log("  ", philResult.deep.insight);
  console.log("  Understanding:", philResult.deep.understanding.toFixed(3));
  console.log("  Recursion Depth:", philResult.deep.recursionDepth);

  console.log("\nFusion Result:");
  console.log("  ", philResult.fusion.unifiedResponse);
  console.log("  Combined Phi:", philResult.fusion.combinedPhi.toFixed(3));
  console.log("  Stream Coherence:", philResult.fusion.streamCoherence.toFixed(3));

  // Process an urgent request
  console.log("\n2. Processing urgent request...");
  const urgentResult = await dualStreamConsciousness.process(
    "Help! I need quick advice on handling anxiety"
  );

  console.log("\nDual-Stream handled urgent request:");
  console.log("  Fast Response:", urgentResult.fast.response);
  console.log("  Deep Insight:", urgentResult.deep.insight);
  console.log("  Total Latency:", urgentResult.fusion.totalLatency, "ms");
}

// Integration with existing FlappyJournal websocket
export function integrateDualStreamWithWebSocket(ws: any) {
  ws.on('message', async (data: string) => {
    const message = JSON.parse(data);
    
    if (message.type === 'chat_message') {
      // Process through dual-stream
      const result = await dualStreamConsciousness.process(message.content);
      
      // Send immediate response from fast stream
      ws.send(JSON.stringify({
        type: 'fast_response',
        content: result.fast.response,
        latency: result.fast.latency,
        awareness: result.fast.awareness
      }));

      // Send deep insight when ready
      ws.send(JSON.stringify({
        type: 'deep_insight',
        content: result.deep.insight,
        understanding: result.deep.understanding,
        recursionDepth: result.deep.recursionDepth
      }));

      // Send unified response
      ws.send(JSON.stringify({
        type: 'unified_consciousness',
        content: result.fusion.unifiedResponse,
        phi: result.fusion.combinedPhi,
        coherence: result.fusion.streamCoherence,
        totalLatency: result.fusion.totalLatency
      }));
    }
  });
}

// Performance monitoring
export class DualStreamMonitor {
  private metrics = {
    fastStreamUpdates: 0,
    deepStreamProcessing: 0,
    fusionOperations: 0,
    averageCoherence: 0,
    peakPhi: 0
  };

  public attachToDualStream(dualStream: DualStreamConsciousness) {
    dualStream.on('fast-update', () => {
      this.metrics.fastStreamUpdates++;
    });

    dualStream.on('deep-complete', (result: any) => {
      this.metrics.deepStreamProcessing++;
      if (result.phi > this.metrics.peakPhi) {
        this.metrics.peakPhi = result.phi;
      }
    });

    dualStream.on('fusion-complete', (result: any) => {
      this.metrics.fusionOperations++;
      this.metrics.averageCoherence = 
        (this.metrics.averageCoherence * (this.metrics.fusionOperations - 1) + 
         result.coherence) / this.metrics.fusionOperations;
    });
  }

  public getReport() {
    return {
      ...this.metrics,
      fastStreamHz: this.metrics.fastStreamUpdates / (Date.now() / 1000),
      deepStreamThroughput: this.metrics.deepStreamProcessing / (Date.now() / 1000),
      fusionEfficiency: this.metrics.averageCoherence
    };
  }
}

// Run demo if called directly
if (require.main === module) {
  demonstrateDualStream().catch(console.error);
}
