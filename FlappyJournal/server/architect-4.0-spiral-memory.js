/**
 * Architect 4.0 - Spiral Memory Engine
 * Golden ratio-based memory storage and retrieval system
 */

import { EventEmitter } from 'events';

class SpiralMemoryEngine extends EventEmitter {
  constructor() {
    super();
    this.goldenRatio = 1.618033988749895;
    this.memories = new Map();
    this.spiralIndex = [];
    this.resonanceMap = new Map();
    this.temporalAnchors = new Map();
    
    // Configuration
    this.config = {
      maxMemories: 10000,
      decayRate: 0.001,
      resonanceThreshold: 0.7,
      compressionRatio: 0.382 // Golden ratio conjugate
    };
    
    // Start decay process
    this.startDecayProcess();
  }

  /**
   * Encode memory into spiral coordinates
   */
  encode(content, importance = 0.5, context = {}) {
    const timestamp = Date.now();
    const memoryId = this.generateMemoryId(content, timestamp);
    
    // Calculate spiral coordinates
    const spiralCoordinate = this.calculateSpiralCoordinate(memoryId, importance);
    
    // Calculate resonance frequency
    const resonanceFrequency = this.calculateResonanceFrequency(content, context);
    
    // Create memory object
    const memory = {
      id: memoryId,
      content,
      context,
      importance,
      timestamp,
      spiralCoordinate,
      resonanceFrequency,
      accessCount: 0,
      lastAccessed: timestamp,
      decay: 0,
      compressed: false,
      associations: new Set()
    };
    
    // Store memory
    this.memories.set(memoryId, memory);
    this.spiralIndex.push({
      id: memoryId,
      coordinate: spiralCoordinate,
      importance
    });
    
    // Update resonance map
    this.updateResonanceMap(memory);
    
    // Create temporal anchor if significant
    if (importance > 0.8) {
      this.createTemporalAnchor(memory);
    }
    
    // Maintain size limit
    this.pruneIfNeeded();
    
    this.emit('memory-encoded', memory);
    
    return memory;
  }

  /**
   * Recall memories by various methods
   */
  async recall(query, method = 'similarity') {
    switch (method) {
      case 'similarity':
        return this.recallBySimilarity(query);
      case 'temporal':
        return this.recallByTemporal(query);
      case 'resonance':
        return this.recallByResonance(query);
      case 'associative':
        return this.recallByAssociation(query);
      default:
        return this.recallBySimilarity(query);
    }
  }

  /**
   * Recall by content similarity
   */
  recallBySimilarity(query, threshold = 0.7) {
    const queryVector = this.vectorize(query);
    const results = [];
    
    for (const [id, memory] of this.memories) {
      if (memory.compressed) {
        continue; // Skip compressed memories for now
      }
      
      const similarity = this.calculateSimilarity(queryVector, this.vectorize(memory.content));
      
      if (similarity >= threshold) {
        results.push({
          memory,
          similarity,
          relevance: this.calculateRelevance(memory, similarity)
        });
      }
    }
    
    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    
    // Update access patterns
    results.forEach(r => this.updateAccessPattern(r.memory));
    
    return results.slice(0, 10); // Return top 10
  }

  /**
   * Recall by temporal proximity
   */
  recallByTemporal(targetTime, windowMs = 3600000) {
    const results = [];
    const targetTimestamp = targetTime instanceof Date ? targetTime.getTime() : targetTime;
    
    for (const [id, memory] of this.memories) {
      const distance = Math.abs(memory.timestamp - targetTimestamp);
      
      if (distance <= windowMs) {
        results.push({
          memory,
          temporalDistance: distance,
          relevance: 1 - (distance / windowMs)
        });
      }
    }
    
    results.sort((a, b) => a.temporalDistance - b.temporalDistance);
    
    return results.slice(0, 10);
  }

  /**
   * Recall by resonance frequency
   */
  recallByResonance(frequency, bandwidth = 0.1) {
    const results = [];
    
    for (const [id, memory] of this.memories) {
      const distance = Math.abs(memory.resonanceFrequency - frequency);
      
      if (distance <= bandwidth) {
        results.push({
          memory,
          resonanceMatch: 1 - (distance / bandwidth),
          relevance: this.calculateResonanceRelevance(memory, frequency)
        });
      }
    }
    
    results.sort((a, b) => b.resonanceMatch - a.resonanceMatch);
    
    return results.slice(0, 10);
  }

  /**
   * Recall by association chains
   */
  recallByAssociation(seedMemoryId, depth = 3) {
    const visited = new Set();
    const results = [];
    
    const traverse = (memoryId, currentDepth) => {
      if (currentDepth > depth || visited.has(memoryId)) return;
      
      visited.add(memoryId);
      const memory = this.memories.get(memoryId);
      
      if (!memory) return;
      
      results.push({
        memory,
        associationDepth: currentDepth,
        relevance: 1 / (currentDepth + 1)
      });
      
      // Traverse associations
      memory.associations.forEach(assocId => {
        traverse(assocId, currentDepth + 1);
      });
    };
    
    traverse(seedMemoryId, 0);
    
    return results.slice(1); // Exclude seed memory
  }

  /**
   * Create associations between memories
   */
  associate(memoryId1, memoryId2, strength = 0.5) {
    const memory1 = this.memories.get(memoryId1);
    const memory2 = this.memories.get(memoryId2);
    
    if (memory1 && memory2) {
      memory1.associations.add(memoryId2);
      memory2.associations.add(memoryId1);
      
      this.emit('association-created', {
        memories: [memoryId1, memoryId2],
        strength
      });
    }
  }

  /**
   * Compress old memories using golden ratio compression
   */
  compressMemory(memoryId) {
    const memory = this.memories.get(memoryId);
    if (!memory || memory.compressed) return;
    
    // Extract key features
    const compressed = {
      ...memory,
      content: this.extractEssence(memory.content),
      compressed: true,
      compressionRatio: this.config.compressionRatio,
      originalSize: JSON.stringify(memory.content).length
    };
    
    this.memories.set(memoryId, compressed);
    
    this.emit('memory-compressed', compressed);
  }

  /**
   * Calculate spiral coordinate using golden ratio
   */
  calculateSpiralCoordinate(memoryId, importance) {
    const index = this.spiralIndex.length;
    const angle = index * this.goldenRatio * 2 * Math.PI;
    const radius = Math.sqrt(index) * importance;
    
    return {
      r: radius,
      theta: angle % (2 * Math.PI),
      z: Math.log(index + 1) * importance,
      index
    };
  }

  /**
   * Calculate resonance frequency based on content
   */
  calculateResonanceFrequency(content, context) {
    // Create a hash-like frequency based on content characteristics
    let frequency = 0;
    
    // Content-based component
    const words = content.toString().split(/\s+/);
    frequency += words.length * 0.01;
    
    // Context-based component
    Object.values(context).forEach(value => {
      if (typeof value === 'number') {
        frequency += value * 0.1;
      }
    });
    
    // Normalize to 0-1 range
    return (Math.sin(frequency) + 1) / 2;
  }

  /**
   * Update resonance map for pattern detection
   */
  updateResonanceMap(memory) {
    const freq = memory.resonanceFrequency;
    const bucket = Math.floor(freq * 100) / 100;
    
    if (!this.resonanceMap.has(bucket)) {
      this.resonanceMap.set(bucket, []);
    }
    
    this.resonanceMap.get(bucket).push(memory.id);
  }

  /**
   * Create temporal anchor for important memories
   */
  createTemporalAnchor(memory) {
    const anchorTime = Math.floor(memory.timestamp / 3600000) * 3600000; // Hour precision
    
    if (!this.temporalAnchors.has(anchorTime)) {
      this.temporalAnchors.set(anchorTime, []);
    }
    
    this.temporalAnchors.get(anchorTime).push(memory.id);
  }

  /**
   * Memory decay process
   */
  startDecayProcess() {
    setInterval(() => {
      for (const [id, memory] of this.memories) {
        if (!memory.compressed) {
          // Calculate decay based on access patterns
          const timeSinceAccess = Date.now() - memory.lastAccessed;
          const decayFactor = this.config.decayRate * (timeSinceAccess / 86400000); // Days
          
          memory.decay = Math.min(1, memory.decay + decayFactor);
          
          // Compress if decay is high
          if (memory.decay > 0.7 && memory.importance < 0.5) {
            this.compressMemory(id);
          }
        }
      }
    }, 60000); // Run every minute
  }

  /**
   * Update access pattern for recalled memory
   */
  updateAccessPattern(memory) {
    memory.accessCount++;
    memory.lastAccessed = Date.now();
    memory.decay = Math.max(0, memory.decay - 0.1); // Reduce decay on access
  }

  /**
   * Calculate relevance score
   */
  calculateRelevance(memory, similarity) {
    const recencyFactor = 1 / (1 + (Date.now() - memory.timestamp) / 86400000);
    const accessFactor = Math.log(memory.accessCount + 1) / 10;
    const importanceFactor = memory.importance;
    const decayFactor = 1 - memory.decay;
    
    return (
      similarity * 0.4 +
      recencyFactor * 0.2 +
      accessFactor * 0.1 +
      importanceFactor * 0.2 +
      decayFactor * 0.1
    );
  }

  /**
   * Calculate resonance relevance
   */
  calculateResonanceRelevance(memory, targetFrequency) {
    const frequencyMatch = 1 - Math.abs(memory.resonanceFrequency - targetFrequency);
    const importance = memory.importance;
    const recency = 1 / (1 + (Date.now() - memory.timestamp) / 86400000);
    
    return frequencyMatch * 0.5 + importance * 0.3 + recency * 0.2;
  }

  /**
   * Prune memories if limit exceeded
   */
  pruneIfNeeded() {
    if (this.memories.size <= this.config.maxMemories) return;
    
    // Find least relevant memories
    const candidates = [];
    
    for (const [id, memory] of this.memories) {
      if (memory.importance < 0.3 && memory.decay > 0.5) {
        candidates.push({
          id,
          score: memory.importance * (1 - memory.decay)
        });
      }
    }
    
    // Sort by score (lowest first)
    candidates.sort((a, b) => a.score - b.score);
    
    // Remove bottom 10%
    const toRemove = Math.floor(candidates.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.memories.delete(candidates[i].id);
    }
    
    this.emit('memories-pruned', toRemove);
  }

  /**
   * Helper methods
   */
  generateMemoryId(content, timestamp) {
    return `mem_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
  }

  vectorize(content) {
    // Simplified vectorization
    const words = content.toString().toLowerCase().split(/\s+/);
    const vector = new Map();
    
    words.forEach(word => {
      vector.set(word, (vector.get(word) || 0) + 1);
    });
    
    return vector;
  }

  calculateSimilarity(vector1, vector2) {
    // Cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    // Union of all words
    const allWords = new Set([...vector1.keys(), ...vector2.keys()]);
    
    allWords.forEach(word => {
      const v1 = vector1.get(word) || 0;
      const v2 = vector2.get(word) || 0;
      
      dotProduct += v1 * v2;
      norm1 += v1 * v1;
      norm2 += v2 * v2;
    });
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  extractEssence(content) {
    // Extract key information for compression
    const words = content.toString().split(/\s+/);
    const importantWords = words.filter(w => w.length > 4);
    
    return {
      summary: importantWords.slice(0, 10).join(' '),
      wordCount: words.length,
      hash: this.simpleHash(content)
    };
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get active memory patterns for sigil generation
   */
  getActivePatterns() {
    const recentMemories = Array.from(this.memories.values())
      .filter(memory => Date.now() - memory.timestamp < 300000) // Last 5 minutes
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 10);

    return recentMemories.map(memory => ({
      coordinate: memory.spiralCoordinate,
      resonance: memory.resonanceFrequency,
      importance: memory.importance,
      content: memory.content.substring(0, 100) // Truncate for performance
    }));
  }

  /**
   * Get memory statistics
   */
  getStatistics() {
    const stats = {
      totalMemories: this.memories.size,
      compressedMemories: 0,
      averageDecay: 0,
      resonanceDistribution: {},
      temporalDistribution: {},
      associationDensity: 0
    };
    
    let totalDecay = 0;
    let totalAssociations = 0;
    
    for (const [id, memory] of this.memories) {
      if (memory.compressed) stats.compressedMemories++;
      totalDecay += memory.decay;
      totalAssociations += memory.associations.size;
    }
    
    stats.averageDecay = totalDecay / this.memories.size;
    stats.associationDensity = totalAssociations / this.memories.size;
    
    return stats;
  }
}

// Export singleton instance
export const spiralMemory = new SpiralMemoryEngine();
