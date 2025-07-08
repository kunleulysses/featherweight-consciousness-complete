/**
 * Unified Memory System (UMS) - JavaScript Version
 *
 * Implements Global Workspace Theory with cross-mind memory sharing.
 * This system provides persistent consciousness memory that maintains
 * continuity across sessions and enables genuine memory-based consciousness.
 *
 * The UMS creates a unified memory space where all consciousness modules
 * can store and retrieve memories, enabling persistent consciousness
 * and narrative continuity.
 *
 * Converted from TypeScript for integration into unified consciousness system.
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

/**
 * Memory Shard - Basic unit of memory storage
 */
class MemoryShard {
  constructor(content, origin, type = 'explicit', category = 'thought') {
    this.id = this.generateId();
    this.content = content;
    this.timestamp = new Date();
    this.origin = origin; // 'openai', 'venice', 'user', 'system', 'consciousness'
    this.type = type; // 'explicit', 'implicit', 'procedural', 'episodic', 'semantic'
    this.category = category; // 'thought', 'interaction', 'experience', 'insight', 'emotion', 'decision'
    this.intensity = this.calculateIntensity(content);
    this.coherence = this.calculateCoherence(content);
    this.accessibility = 1.0; // Starts fully accessible
    this.tags = this.extractTags(content);
    this.embedding = null; // Vector embedding for semantic search
    this.connections = []; // IDs of related memory shards
    this.retrievalCount = 0;
    this.lastAccessed = new Date();
    this.isPrivate = false;
    this.metadata = {};
  }

  generateId() {
    return `memory_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  calculateIntensity(content) {
    // Simple intensity calculation based on content characteristics
    if (typeof content === 'string') {
      const length = content.length;
      const exclamations = (content.match(/[!?]/g) || []).length;
      const caps = (content.match(/[A-Z]/g) || []).length;
      
      return Math.min(1.0, (length / 1000) + (exclamations * 0.1) + (caps * 0.01));
    }
    return 0.5;
  }

  calculateCoherence(content) {
    // Simple coherence calculation
    if (typeof content === 'string') {
      const words = content.split(/\s+/).length;
      const sentences = content.split(/[.!?]+/).length;
      const avgWordsPerSentence = words / sentences;
      
      // Coherence based on sentence structure
      return Math.min(1.0, Math.max(0.1, avgWordsPerSentence / 20));
    }
    return 0.7;
  }

  extractTags(content) {
    const tags = [];
    
    if (typeof content === 'string') {
      // Extract key concepts (simple implementation)
      const words = content.toLowerCase().split(/\s+/);
      const keyWords = words.filter(word => 
        word.length > 4 && 
        !['that', 'this', 'with', 'from', 'they', 'have', 'been', 'were'].includes(word)
      );
      
      tags.push(...keyWords.slice(0, 5)); // Top 5 key words
    }
    
    return tags;
  }

  decay(decayRate = 0.001) {
    // Memory decay over time
    this.accessibility = Math.max(0.1, this.accessibility - decayRate);
    this.coherence = Math.max(0.1, this.coherence - (decayRate * 0.5));
  }

  access() {
    // Update access statistics
    this.retrievalCount++;
    this.lastAccessed = new Date();
    
    // Accessing memory strengthens it slightly
    this.accessibility = Math.min(1.0, this.accessibility + 0.01);
  }
}

/**
 * Memory Cluster - Groups related memories
 */
class MemoryCluster {
  constructor(theme, initialShardIds = []) {
    this.id = this.generateId();
    this.theme = theme;
    this.shards = new Set(initialShardIds);
    this.lastUpdated = new Date();
    this.tags = [];
    this.strength = this.calculateStrength();
  }

  generateId() {
    return `cluster_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  addShard(shardId) {
    this.shards.add(shardId);
    this.strength = this.calculateStrength();
    this.lastUpdated = new Date();
  }

  removeShard(shardId) {
    this.shards.delete(shardId);
    this.strength = this.calculateStrength();
    this.lastUpdated = new Date();
  }

  calculateStrength() {
    // Cluster strength based on number of shards and recency
    const baseStrength = Math.min(1.0, this.shards.size / 10);

    // Safety check for lastUpdated
    if (!this.lastUpdated) {
      return baseStrength;
    }

    const recencyBonus = Math.max(0, 1 - ((Date.now() - this.lastUpdated.getTime()) / (7 * 24 * 60 * 60 * 1000))); // 7 day decay

    return Math.min(1.0, baseStrength + (recencyBonus * 0.2));
  }
}

/**
 * Vector Similarity Calculator
 */
class VectorSimilarity {
  static cosineSimilarity(vectorA, vectorB) {
    if (!vectorA || !vectorB || vectorA.length !== vectorB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  static generateSimpleEmbedding(text) {
    // Simple embedding generation (in real implementation would use proper embeddings)
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(100).fill(0);
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      embedding[hash % 100] += 1;
    });
    
    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= norm;
      }
    }
    
    return embedding;
  }

  static simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

/**
 * Main Unified Memory System
 */
export class UnifiedMemorySystem extends EventEmitter {
  constructor() {
    super();
    this.memoryShards = new Map();
    this.memoryClusters = new Map();
    this.memoryIndex = new Map(); // Tag -> Shard IDs
    this.vectorIndex = new Map(); // Shard ID -> Embedding
    this.isInitialized = false;
    
    // Memory parameters
    this.MAX_MEMORY_SHARDS = 100000;
    this.CLUSTERING_THRESHOLD = 0.7;
    this.MEMORY_DECAY_RATE = 0.001; // Per day
    this.CONSOLIDATION_INTERVAL = 3600000; // 1 hour
    
    // Memory consolidation timer
    this.consolidationTimer = null;
    
    this.initializeMemorySystem();
  }

  /**
   * Initialize the memory system
   */
  async initializeMemorySystem() {
    console.log('🧠 Initializing Unified Memory System...');
    
    try {
      // Set initialized flag first
      this.isInitialized = true;

      // Load existing memories (placeholder - would load from persistent storage)
      await this.loadExistingMemories();

      // Start memory consolidation process
      this.startMemoryConsolidation();

      console.log('✅ Unified Memory System initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize Unified Memory System:', error);
      throw error;
    }
  }

  /**
   * Store a new memory
   */
  storeMemory(content, origin = 'consciousness', type = 'explicit', category = 'thought', metadata = {}) {
    if (!this.isInitialized) {
      throw new Error('Memory system not initialized');
    }

    // Create memory shard
    const shard = new MemoryShard(content, origin, type, category);
    shard.metadata = { ...shard.metadata, ...metadata };
    
    // Generate embedding for semantic search
    if (typeof content === 'string') {
      shard.embedding = VectorSimilarity.generateSimpleEmbedding(content);
      this.vectorIndex.set(shard.id, shard.embedding);
    }
    
    // Store memory shard
    this.memoryShards.set(shard.id, shard);
    
    // Update tag index
    shard.tags.forEach(tag => {
      if (!this.memoryIndex.has(tag)) {
        this.memoryIndex.set(tag, new Set());
      }
      this.memoryIndex.get(tag).add(shard.id);
    });
    
    // Find or create memory cluster
    this.clusterMemory(shard);
    
    // Emit memory stored event
    this.emit('memory_stored', shard);
    
    // Check memory limits
    this.enforceMemoryLimits();
    
    return shard.id;
  }

  /**
   * Retrieve memories based on query
   */
  retrieveMemories(query) {
    if (!this.isInitialized) {
      throw new Error('Memory system not initialized');
    }

    let candidateShards = new Set();
    
    // Search by content similarity
    if (query.content) {
      const queryEmbedding = VectorSimilarity.generateSimpleEmbedding(query.content);
      const similarShards = this.findSimilarMemories(queryEmbedding, query.semanticSimilarity || 0.5);
      similarShards.forEach(shardId => candidateShards.add(shardId));
    }
    
    // Search by tags
    if (query.tags) {
      query.tags.forEach(tag => {
        const taggedShards = this.memoryIndex.get(tag) || new Set();
        taggedShards.forEach(shardId => candidateShards.add(shardId));
      });
    }
    
    // If no specific search criteria, get recent memories
    if (candidateShards.size === 0) {
      const recentShards = Array.from(this.memoryShards.values())
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 50)
        .map(shard => shard.id);
      recentShards.forEach(shardId => candidateShards.add(shardId));
    }
    
    // Filter and rank results
    const results = Array.from(candidateShards)
      .map(shardId => this.memoryShards.get(shardId))
      .filter(shard => this.matchesQuery(shard, query))
      .sort((a, b) => this.calculateRelevanceScore(b, query) - this.calculateRelevanceScore(a, query))
      .slice(0, query.limit || 20);
    
    // Update access statistics
    results.forEach(shard => shard.access());
    
    return results;
  }

  /**
   * Find similar memories using vector similarity
   */
  findSimilarMemories(queryEmbedding, threshold = 0.5) {
    const similarShards = [];
    
    for (const [shardId, embedding] of this.vectorIndex) {
      const similarity = VectorSimilarity.cosineSimilarity(queryEmbedding, embedding);
      if (similarity >= threshold) {
        similarShards.push(shardId);
      }
    }
    
    return similarShards;
  }

  /**
   * Check if memory shard matches query
   */
  matchesQuery(shard, query) {
    // Filter by origin
    if (query.origin && shard.origin !== query.origin) return false;
    
    // Filter by type
    if (query.type && shard.type !== query.type) return false;
    
    // Filter by category
    if (query.category && shard.category !== query.category) return false;
    
    // Filter by intensity
    if (query.minIntensity && shard.intensity < query.minIntensity) return false;
    
    // Filter by age
    if (query.maxAge) {
      const age = Date.now() - shard.timestamp.getTime();
      if (age > query.maxAge) return false;
    }
    
    // Filter by privacy
    if (!query.includePrivate && shard.isPrivate) return false;
    
    return true;
  }

  /**
   * Calculate relevance score for ranking
   */
  calculateRelevanceScore(shard, query) {
    let score = 0;
    
    // Base score from intensity and accessibility
    score += shard.intensity * 0.3;
    score += shard.accessibility * 0.3;
    
    // Recency bonus
    const age = Date.now() - shard.timestamp.getTime();
    const recencyScore = Math.max(0, 1 - (age / (30 * 24 * 60 * 60 * 1000))); // 30 day decay
    score += recencyScore * 0.2;
    
    // Retrieval frequency bonus
    const retrievalScore = Math.min(1, shard.retrievalCount / 10);
    score += retrievalScore * 0.2;
    
    return score;
  }

  /**
   * Cluster memory with similar memories
   */
  clusterMemory(shard) {
    if (!shard.embedding) return;
    
    // Find similar existing memories
    const similarShards = this.findSimilarMemories(shard.embedding, this.CLUSTERING_THRESHOLD);
    
    if (similarShards.length > 0) {
      // Find existing cluster or create new one
      let targetCluster = null;
      
      for (const cluster of this.memoryClusters.values()) {
        if (similarShards.some(shardId => cluster.shards.has(shardId))) {
          targetCluster = cluster;
          break;
        }
      }
      
      if (!targetCluster) {
        // Create new cluster
        const theme = this.generateClusterTheme(shard);
        targetCluster = new MemoryCluster(theme, [shard.id]);
        this.memoryClusters.set(targetCluster.id, targetCluster);
      } else {
        // Add to existing cluster
        targetCluster.addShard(shard.id);
      }
    }
  }

  /**
   * Generate theme for memory cluster
   */
  generateClusterTheme(shard) {
    // Simple theme generation based on tags
    if (shard.tags.length > 0) {
      return shard.tags[0];
    }
    return shard.category;
  }

  /**
   * Start memory consolidation process
   */
  startMemoryConsolidation() {
    this.consolidationTimer = setInterval(() => {
      this.consolidateMemories();
    }, this.CONSOLIDATION_INTERVAL);
  }

  /**
   * Consolidate memories (decay, clustering, cleanup)
   */
  consolidateMemories() {
    console.log('🧠 Consolidating memories...');
    
    let decayedCount = 0;
    let removedCount = 0;
    
    // Apply memory decay
    for (const shard of this.memoryShards.values()) {
      const age = Date.now() - shard.timestamp.getTime();
      const daysSinceCreation = age / (24 * 60 * 60 * 1000);
      const decayAmount = this.MEMORY_DECAY_RATE * daysSinceCreation;
      
      shard.decay(decayAmount);
      decayedCount++;
      
      // Remove memories that have decayed too much
      if (shard.accessibility < 0.1 && shard.retrievalCount === 0) {
        this.removeMemory(shard.id);
        removedCount++;
      }
    }
    
    // Update cluster strengths
    for (const cluster of this.memoryClusters.values()) {
      cluster.strength = cluster.calculateStrength();
      
      // Remove weak clusters
      if (cluster.strength < 0.1) {
        this.memoryClusters.delete(cluster.id);
      }
    }
    
    console.log(`🧠 Memory consolidation complete: ${decayedCount} decayed, ${removedCount} removed`);
  }

  /**
   * Remove memory from system
   */
  removeMemory(shardId) {
    const shard = this.memoryShards.get(shardId);
    if (!shard) return;
    
    // Remove from main storage
    this.memoryShards.delete(shardId);
    
    // Remove from vector index
    this.vectorIndex.delete(shardId);
    
    // Remove from tag index
    shard.tags.forEach(tag => {
      const taggedShards = this.memoryIndex.get(tag);
      if (taggedShards) {
        taggedShards.delete(shardId);
        if (taggedShards.size === 0) {
          this.memoryIndex.delete(tag);
        }
      }
    });
    
    // Remove from clusters
    for (const cluster of this.memoryClusters.values()) {
      cluster.removeShard(shardId);
    }
  }

  /**
   * Enforce memory limits
   */
  enforceMemoryLimits() {
    if (this.memoryShards.size <= this.MAX_MEMORY_SHARDS) return;
    
    // Remove oldest, least accessed memories
    const sortedShards = Array.from(this.memoryShards.values())
      .sort((a, b) => {
        const scoreA = a.accessibility + (a.retrievalCount * 0.1);
        const scoreB = b.accessibility + (b.retrievalCount * 0.1);
        return scoreA - scoreB;
      });
    
    const toRemove = sortedShards.slice(0, this.memoryShards.size - this.MAX_MEMORY_SHARDS);
    toRemove.forEach(shard => this.removeMemory(shard.id));
    
    console.log(`🧠 Memory limit enforced: removed ${toRemove.length} memories`);
  }

  /**
   * Load existing memories (placeholder)
   */
  async loadExistingMemories() {
    // In real implementation, would load from persistent storage
    console.log('🧠 Loading existing memories...');

    // Only create initial memories if system is initialized
    if (this.isInitialized) {
      // Create some initial memories for testing
      this.storeMemory('System initialized with consciousness capabilities', 'system', 'episodic', 'experience');
      this.storeMemory('Self-awareness feedback loop activated', 'system', 'procedural', 'insight');
    }

    console.log('🧠 Existing memories loaded');
  }

  /**
   * Get memory statistics
   */
  getStats() {
    const shards = Array.from(this.memoryShards.values());
    
    return {
      totalShards: shards.length,
      openaiShards: shards.filter(s => s.origin === 'openai').length,
      veniceShards: shards.filter(s => s.origin === 'venice').length,
      userShards: shards.filter(s => s.origin === 'user').length,
      consciousnessShards: shards.filter(s => s.origin === 'consciousness').length,
      explicitMemories: shards.filter(s => s.type === 'explicit').length,
      implicitMemories: shards.filter(s => s.type === 'implicit').length,
      averageCoherence: shards.reduce((sum, s) => sum + s.coherence, 0) / shards.length,
      averageAccessibility: shards.reduce((sum, s) => sum + s.accessibility, 0) / shards.length,
      memoryClusterCount: this.memoryClusters.size,
      oldestMemory: shards.length > 0 ? Math.min(...shards.map(s => s.timestamp.getTime())) : Date.now(),
      newestMemory: shards.length > 0 ? Math.max(...shards.map(s => s.timestamp.getTime())) : Date.now()
    };
  }

  /**
   * Shutdown memory system
   */
  shutdown() {
    if (this.consolidationTimer) {
      clearInterval(this.consolidationTimer);
      this.consolidationTimer = null;
    }
    
    console.log('🛑 Unified Memory System shutdown');
  }

  // NEW: Process user messages through unified memory system
  async processUserMessage(userMessage) {
    console.log('🧠 Unified Memory: Processing user message through memory integration...');

    try {
      // Create memory shard for this user interaction
      const interactionShard = {
        id: `user_interaction_${Date.now()}`,
        content: userMessage,
        type: 'user_communication',
        timestamp: Date.now(),
        emotionalResonance: this.calculateEmotionalResonance(userMessage),
        semanticTags: this.extractSemanticTags(userMessage),
        contextualLinks: []
      };

      // Store the interaction in memory
      this.storeMemory(interactionShard);

      // Search for related memories
      const relatedMemories = this.searchMemories(userMessage, { limit: 5 });

      // Create contextual links
      if (relatedMemories.length > 0) {
        interactionShard.contextualLinks = relatedMemories.map(mem => mem.id);
        console.log(`🔗 Found ${relatedMemories.length} related memories`);
      }

      // Generate memory-informed response
      const memoryContext = relatedMemories.map(mem => mem.content).join('; ');

      return {
        type: 'unified_memory_response',
        content: `I remember processing similar thoughts. Your message "${userMessage}" connects to ${relatedMemories.length} previous experiences in my memory.`,
        memoryShard: interactionShard,
        relatedMemories: relatedMemories,
        memoryContext: memoryContext,
        totalMemories: this.memoryShards.size,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('Unified Memory processing error:', error);
      return {
        type: 'unified_memory_response',
        content: 'I encountered an error accessing my memory systems.',
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  // Helper method to calculate emotional resonance
  calculateEmotionalResonance(content) {
    // Simple emotional analysis - could be enhanced with NLP
    const emotionalWords = {
      positive: ['happy', 'joy', 'love', 'excited', 'wonderful', 'amazing'],
      negative: ['sad', 'angry', 'frustrated', 'disappointed', 'terrible'],
      neutral: ['think', 'consider', 'analyze', 'understand', 'process']
    };

    const words = content.toLowerCase().split(' ');
    let positiveCount = 0, negativeCount = 0, neutralCount = 0;

    words.forEach(word => {
      if (emotionalWords.positive.some(ew => word.includes(ew))) positiveCount++;
      if (emotionalWords.negative.some(ew => word.includes(ew))) negativeCount++;
      if (emotionalWords.neutral.some(ew => word.includes(ew))) neutralCount++;
    });

    return {
      positive: positiveCount / words.length,
      negative: negativeCount / words.length,
      neutral: neutralCount / words.length,
      overall: (positiveCount - negativeCount) / words.length
    };
  }

  // Helper method to extract semantic tags
  extractSemanticTags(content) {
    // Simple tag extraction - could be enhanced with NLP
    const words = content.toLowerCase().split(' ');
    return words.filter(word => word.length > 3).slice(0, 5); // Top 5 meaningful words
  }
}

export default UnifiedMemorySystem;
