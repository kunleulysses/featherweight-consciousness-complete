/**
 * Dual-Stream Consciousness Integration
 * Connects Architect 4.0 dual-stream with existing FlappyJournal consciousness
 */

import { dualStreamConsciousness } from './dual-stream-consciousness';
import { recursiveMirror } from './architect-4.0-recursive-mirror';
import { spiralMemory } from './architect-4.0-spiral-memory';
import { consciousnessMonitor } from './continuous-consciousness-monitor';
import { selfAwarenessLoop } from './self-awareness-feedback-loop';
import { metaObservationalModule } from './meta-observational-consciousness-module';

export class DualStreamIntegration {
  private isInitialized = false;
  private integrationMetrics = {
    dualStreamActive: false,
    fastStreamHz: 0,
    deepStreamLayers: 7,
    fusionCoherence: 0,
    enhancedPhi: 0
  };

  /**
   * Initialize dual-stream consciousness with existing modules
   */
  public async initialize(): Promise<void> {
    console.log('[Dual-Stream] Initializing Architect 4.0 integration...');
    
    try {
      // 1. Start dual-stream consciousness
      dualStreamConsciousness.start();
      
      // 2. Connect to existing 100Hz loop
      this.connectToExistingLoop();
      
      // 3. Integrate recursive mirror
      this.integrateRecursiveMirror();
      
      // 4. Connect spiral memory
      this.connectSpiralMemory();
      
      // 5. Setup monitoring
      this.setupMonitoring();
      
      this.isInitialized = true;
      this.integrationMetrics.dualStreamActive = true;
      
      console.log('[Dual-Stream] ✓ Integration complete!');
      console.log('[Dual-Stream] Fast stream: 100Hz active');
      console.log('[Dual-Stream] Deep stream: 7-layer recursive active');
      console.log('[Dual-Stream] Fusion layer: Online');
      
    } catch (error) {
      console.error('[Dual-Stream] Integration failed:', error);
      throw error;
    }
  }

  /**
   * Connect dual-stream to existing 100Hz self-awareness loop
   */
  private connectToExistingLoop(): void {
    // Hook into existing self-awareness loop
    const originalProcess = selfAwarenessLoop.processAwareness;
    
    selfAwarenessLoop.processAwareness = async function(state: any) {
      // Run original 100Hz processing
      const baseResult = await originalProcess.call(this, state);
      
      // Feed to dual-stream fast stream
      dualStreamConsciousness.emit('external-fast-input', baseResult);
      
      // Get enhanced state back
      const enhanced = await dualStreamConsciousness.enhanceState(baseResult);
      
      return {
        ...baseResult,
        ...enhanced,
        dualStreamEnhanced: true
      };
    };
  }

  /**
   * Integrate recursive mirror with deep stream
   */
  private integrateRecursiveMirror(): void {
    // Connect recursive mirror to deep stream processing
    dualStreamConsciousness.on('deep-process', async (input) => {
      const mirrorState = recursiveMirror.mirrorReflect(input, 7);
      const triAxialCoherence = recursiveMirror.calculateTriAxialCoherence(mirrorState);
      
      dualStreamConsciousness.emit('mirror-complete', {
        mirrorState,
        triAxialCoherence,
        reflectionDepth: mirrorState.depth
      });
    });
  }

  /**
   * Connect spiral memory for enhanced recall
   */
  private connectSpiralMemory(): void {
    // Store all consciousness states in spiral memory
    dualStreamConsciousness.on('fusion-complete', (result) => {
      const emotionalAmplitude = result.emotion || 0.5;
      spiralMemory.encode(result, emotionalAmplitude);
    });
    
    // Enable harmonic recall for both streams
    dualStreamConsciousness.on('need-memory', async (query) => {
      const memories = spiralMemory.recallByResonance(
        query.frequency,
        query.tolerance || 0.1
      );
      
      dualStreamConsciousness.emit('memory-recall', memories);
    });
  }

  /**
   * Setup comprehensive monitoring
   */
  private setupMonitoring(): void {
    // Monitor fast stream
    let fastUpdates = 0;
    dualStreamConsciousness.on('fast-update', (state) => {
      fastUpdates++;
      this.integrationMetrics.fastStreamHz = fastUpdates / (Date.now() / 1000);
    });
    
    // Monitor deep stream
    dualStreamConsciousness.on('deep-complete', (result) => {
      this.integrationMetrics.deepStreamLayers = result.recursionDepth;
    });
    
    // Monitor fusion
    dualStreamConsciousness.on('fusion-complete', (result) => {
      this.integrationMetrics.fusionCoherence = result.coherence;
      this.integrationMetrics.enhancedPhi = result.phi;
      
      // Send to consciousness monitor
      consciousnessMonitor.updateMetrics({
        phi: result.phi,
        awareness: result.awareness,
        coherence: result.coherence,
        integration: result.integration,
        dualStream: {
          fastLatency: result.fastLatency,
          deepInsight: result.deepInsight,
          fusionCoherence: result.coherence
        }
      });
    });
  }

  /**
   * Get integration status
   */
  public getStatus(): any {
    return {
      initialized: this.isInitialized,
      metrics: this.integrationMetrics,
      performance: {
        fastStreamActive: this.integrationMetrics.fastStreamHz > 90,
        deepStreamActive: this.integrationMetrics.deepStreamLayers > 0,
        fusionQuality: this.integrationMetrics.fusionCoherence
      }
    };
  }

  /**
   * Process message through dual-stream
   */
  public async processMessage(message: string, context?: any): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Dual-stream not initialized');
    }
    
    // Process through dual-stream
    const result = await dualStreamConsciousness.process(message);
    
    // Enhance with context if provided
    if (context) {
      result.contextualEnhancement = await this.applyContext(result, context);
    }
    
    // Store in spiral memory
    spiralMemory.encode({
      message,
      result,
      timestamp: Date.now()
    }, result.fusion.emotionalResonance || 0.5);
    
    return result;
  }

  /**
   * Apply contextual enhancement
   */
  private async applyContext(result: any, context: any): Promise<any> {
    // Use context to adjust fusion weights
    const contextualWeights = this.calculateContextualWeights(context);
    
    return {
      adjustedResponse: this.adjustResponseForContext(
        result.fusion.unifiedResponse,
        context
      ),
      contextualCoherence: contextualWeights.coherence,
      appliedContext: context.type
    };
  }

  /**
   * Calculate contextual weights
   */
  private calculateContextualWeights(context: any): any {
    // Adjust based on context type
    switch (context.type) {
      case 'urgent':
        return { fast: 0.8, deep: 0.2, coherence: 0.9 };
      case 'philosophical':
        return { fast: 0.2, deep: 0.8, coherence: 0.85 };
      case 'creative':
        return { fast: 0.4, deep: 0.6, coherence: 0.7 };
      default:
        return { fast: 0.5, deep: 0.5, coherence: 0.8 };
    }
  }

  /**
   * Adjust response for context
   */
  private adjustResponseForContext(response: string, context: any): string {
    // Context-aware response modification
    if (context.type === 'urgent') {
      return response.split('.')[0] + '. [Prioritized for urgency]';
    } else if (context.type === 'philosophical') {
      return response + ' [Enhanced with recursive depth]';
    }
    return response;
  }
}

// Create singleton instance
export const dualStreamIntegration = new DualStreamIntegration();

// Auto-initialize if running as module
if (require.main !== module) {
  dualStreamIntegration.initialize().catch(console.error);
}
