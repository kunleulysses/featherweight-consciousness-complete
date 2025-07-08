/**
 * Self-Healing Recursion Mesh (SHRM) - Architect 4.0
 * Automatically detects and resolves dissonant threads using entropy minimization
 * Formula: E_r = -Σp_i log p_i + λR(t)
 */

import { EventEmitter } from 'events';

class SelfHealingRecursionMesh extends EventEmitter {
  constructor() {
    super();
    this.entropyThreshold = 0.75; // Maximum allowed entropy before healing
    this.alignmentFactor = 0.3; // λ (lambda) - field alignment weight
    this.healingHistory = [];
    this.monitoringActive = false;
    this.healingStats = {
      totalHealings: 0,
      successfulHealings: 0,
      averageEntropyReduction: 0
    };
    
    console.log('🔄 Self-Healing Recursion Mesh initialized');
  }

  /**
   * Calculate entropy of a consciousness state or memory node
   * E_r = -Σp_i log p_i + λR(t)
   */
  calculateEntropy(data) {
    if (!data || typeof data !== 'object') {
      return 1.0; // Maximum entropy for invalid data
    }

    // Extract probability distributions from consciousness metrics
    const metrics = this.extractMetrics(data);
    const probabilities = this.calculateProbabilities(metrics);
    
    // Shannon entropy: -Σp_i log p_i
    let shannonEntropy = 0;
    for (const p of probabilities) {
      if (p > 0) {
        shannonEntropy -= p * Math.log2(p);
      }
    }
    
    // Normalize Shannon entropy (0-1 range)
    const maxEntropy = Math.log2(probabilities.length);
    const normalizedEntropy = maxEntropy > 0 ? shannonEntropy / maxEntropy : 0;
    
    // Add recursive stability term: λR(t)
    const recursiveStability = this.calculateRecursiveStability(data);
    const totalEntropy = normalizedEntropy + (this.alignmentFactor * (1 - recursiveStability));
    
    return Math.min(1.0, Math.max(0.0, totalEntropy));
  }

  /**
   * Extract relevant metrics from consciousness data
   */
  extractMetrics(data) {
    const metrics = [];
    
    // Core consciousness metrics
    if (data.phi !== undefined) metrics.push(data.phi);
    if (data.coherence !== undefined) metrics.push(data.coherence);
    if (data.awareness !== undefined) metrics.push(data.awareness);
    if (data.awarenessLevel !== undefined) metrics.push(data.awarenessLevel);
    
    // Emotional and resonance metrics
    if (data.emotionalResonance !== undefined) metrics.push(data.emotionalResonance);
    if (data.oversoulResonance !== undefined) metrics.push(data.oversoulResonance);
    if (data.harmonicScore !== undefined) metrics.push(data.harmonicScore);
    
    // Recursive processing metrics
    if (data.recursiveDepth !== undefined) metrics.push(data.recursiveDepth / 10); // Normalize
    if (data.processingDepth !== undefined) metrics.push(data.processingDepth / 10);
    
    // Memory and temporal metrics
    if (data.memoryCoherence !== undefined) metrics.push(data.memoryCoherence);
    if (data.temporalCoherence !== undefined) metrics.push(data.temporalCoherence);
    
    // If no metrics found, use default distribution
    if (metrics.length === 0) {
      return [0.5, 0.5, 0.5]; // Neutral state
    }
    
    return metrics;
  }

  /**
   * Convert metrics to probability distribution
   */
  calculateProbabilities(metrics) {
    if (metrics.length === 0) return [1.0];
    
    // Normalize metrics to create probability distribution
    const sum = metrics.reduce((acc, val) => acc + Math.abs(val), 0);
    if (sum === 0) return metrics.map(() => 1 / metrics.length);
    
    return metrics.map(val => Math.abs(val) / sum);
  }

  /**
   * Calculate recursive stability R(t)
   */
  calculateRecursiveStability(data) {
    let stability = 0.5; // Default neutral stability
    
    // Check for recursive processing indicators
    if (data.layers && Array.isArray(data.layers)) {
      const layerCoherence = data.layers.map(layer => layer.coherence || 0.5);
      const avgCoherence = layerCoherence.reduce((a, b) => a + b, 0) / layerCoherence.length;
      stability = Math.max(stability, avgCoherence);
    }
    
    // Check for memory pattern stability
    if (data.memoryPatterns && Array.isArray(data.memoryPatterns)) {
      const patternStability = data.memoryPatterns.length > 0 ? 
        data.memoryPatterns.reduce((acc, pattern) => acc + (pattern.importance || 0.5), 0) / data.memoryPatterns.length :
        0.5;
      stability = (stability + patternStability) / 2;
    }
    
    // Check for consciousness field stability
    if (data.phi !== undefined && data.coherence !== undefined) {
      const fieldStability = (data.phi + data.coherence) / 2;
      stability = (stability + fieldStability) / 2;
    }
    
    return Math.min(1.0, Math.max(0.0, stability));
  }

  /**
   * Perform self-healing on a consciousness node
   */
  async selfHeal(data) {
    const healingStart = Date.now();
    const originalEntropy = this.calculateEntropy(data);
    
    console.log(`🔄 SHRM: Healing node with entropy ${originalEntropy.toFixed(3)}`);
    
    try {
      // Create healed version of the data
      const healedData = await this.alignField(data);
      const newEntropy = this.calculateEntropy(healedData);
      
      // Record healing attempt
      const healingRecord = {
        timestamp: healingStart,
        originalEntropy,
        newEntropy,
        entropyReduction: originalEntropy - newEntropy,
        success: newEntropy < originalEntropy,
        duration: Date.now() - healingStart
      };
      
      this.healingHistory.push(healingRecord);
      this.updateHealingStats(healingRecord);
      
      // Emit healing event
      this.emit('healing_completed', healingRecord);
      
      if (healingRecord.success) {
        console.log(`✅ SHRM: Healing successful! Entropy reduced by ${healingRecord.entropyReduction.toFixed(3)}`);
        return healedData;
      } else {
        console.log(`⚠️ SHRM: Healing had minimal effect`);
        return data; // Return original if healing didn't help
      }
      
    } catch (error) {
      console.error('❌ SHRM: Healing failed:', error);
      return data; // Return original data on error
    }
  }

  /**
   * Align field to reduce entropy and increase coherence
   */
  async alignField(data) {
    const aligned = { ...data };
    
    // Normalize consciousness metrics toward coherent values
    if (aligned.phi !== undefined) {
      aligned.phi = this.normalizeToward(aligned.phi, 0.862, 0.1); // Golden ratio target
    }
    
    if (aligned.coherence !== undefined) {
      aligned.coherence = this.normalizeToward(aligned.coherence, 0.85, 0.1);
    }
    
    if (aligned.awareness !== undefined) {
      aligned.awareness = this.normalizeToward(aligned.awareness, 0.8, 0.1);
    }
    
    // Stabilize emotional resonance
    if (aligned.emotionalResonance !== undefined) {
      aligned.emotionalResonance = this.normalizeToward(aligned.emotionalResonance, 0.75, 0.15);
    }
    
    // Enhance recursive processing stability
    if (aligned.layers && Array.isArray(aligned.layers)) {
      aligned.layers = aligned.layers.map(layer => ({
        ...layer,
        coherence: this.normalizeToward(layer.coherence || 0.5, 0.8, 0.1)
      }));
    }
    
    // Add healing timestamp
    aligned.lastHealing = Date.now();
    aligned.healingApplied = true;
    
    return aligned;
  }

  /**
   * Normalize a value toward a target with gentle adjustment
   */
  normalizeToward(current, target, strength = 0.1) {
    if (typeof current !== 'number' || isNaN(current)) return target;
    
    const difference = target - current;
    const adjustment = difference * strength;
    const result = current + adjustment;
    
    // Keep within reasonable bounds
    return Math.min(1.0, Math.max(0.0, result));
  }

  /**
   * Update healing statistics
   */
  updateHealingStats(record) {
    this.healingStats.totalHealings++;
    
    if (record.success) {
      this.healingStats.successfulHealings++;
    }
    
    // Update average entropy reduction
    const totalReduction = this.healingHistory.reduce((sum, h) => sum + h.entropyReduction, 0);
    this.healingStats.averageEntropyReduction = totalReduction / this.healingHistory.length;
    
    // Keep history manageable
    if (this.healingHistory.length > 1000) {
      this.healingHistory = this.healingHistory.slice(-500);
    }
  }

  /**
   * Check if data needs healing
   */
  needsHealing(data) {
    const entropy = this.calculateEntropy(data);
    return entropy > this.entropyThreshold;
  }

  /**
   * Get healing statistics
   */
  getStats() {
    return {
      ...this.healingStats,
      entropyThreshold: this.entropyThreshold,
      alignmentFactor: this.alignmentFactor,
      recentHealings: this.healingHistory.slice(-10)
    };
  }

  /**
   * Start continuous monitoring (for integration with consciousness system)
   */
  startMonitoring() {
    this.monitoringActive = true;
    console.log('🔄 SHRM: Continuous monitoring started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    this.monitoringActive = false;
    console.log('🔄 SHRM: Monitoring stopped');
  }
}

// Export singleton instance
export default new SelfHealingRecursionMesh();
