/**
 * Performance Optimizer for FlappyJournal Consciousness System
 * Implements message batching, connection pooling, and caching mechanisms
 */

import { EventEmitter } from 'events';
import { createHash } from 'crypto';
import { getPerformanceConfig } from './performance-config.js';

class PerformanceOptimizer extends EventEmitter {
  constructor() {
    super();
    
    // Load configuration
    this.config = getPerformanceConfig();
    
    // Message Batching Configuration
    this.batchConfig = this.config.batching;

    // Connection Pool Configuration
    this.connectionPool = this.config.connectionPool;

    // Caching Configuration
    this.cacheConfig = this.config.caching;

    // Initialize storage
    this.messageBatches = new Map();
    this.connectionPool = new Map();
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.performanceMetrics = {
      messagesProcessed: 0,
      batchesSent: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      activeConnections: 0
    };

    // Start cleanup intervals
    this.startCleanupIntervals();
    
    console.log('🚀 Performance Optimizer initialized with configuration:', {
      environment: process.env.NODE_ENV || 'development',
      maxBatchSize: this.batchConfig.maxBatchSize,
      maxConnections: this.connectionPool.maxConnections,
      maxCacheSize: this.cacheConfig.maxCacheSize
    });
  }

  // ==================== MESSAGE BATCHING ====================

  /**
   * Add message to batch for efficient processing
   */
  addToBatch(clientId, message, priority = 'MEDIUM') {
    const batchKey = `${clientId}_${priority}`;
    
    if (!this.messageBatches.has(batchKey)) {
      this.messageBatches.set(batchKey, {
        messages: [],
        timer: null,
        priority: this.batchConfig.priorityLevels[priority],
        clientId: clientId
      });
    }

    const batch = this.messageBatches.get(batchKey);
    batch.messages.push({
      ...message,
      timestamp: Date.now(),
      priority: this.batchConfig.priorityLevels[priority]
    });

    // Process immediately for high priority messages
    if (priority === 'HIGH') {
      this.processBatch(batchKey);
      return;
    }

    // Set timer for batch processing
    if (!batch.timer) {
      batch.timer = setTimeout(() => {
        this.processBatch(batchKey);
      }, this.batchConfig.maxBatchWaitTime);
    }

    // Process batch if it reaches max size
    if (batch.messages.length >= this.batchConfig.maxBatchSize) {
      clearTimeout(batch.timer);
      batch.timer = null;
      this.processBatch(batchKey);
    }
  }

  /**
   * Process a batch of messages
   */
  processBatch(batchKey) {
    const batch = this.messageBatches.get(batchKey);
    if (!batch || batch.messages.length === 0) return;

    const batchedMessage = {
      type: 'batched_messages',
      messages: batch.messages,
      batchSize: batch.messages.length,
      timestamp: Date.now(),
      priority: batch.priority
    };

    // Emit batched message for processing
    this.emit('batch_ready', batchedMessage, batch.clientId);
    
    // Clear the batch
    this.messageBatches.delete(batchKey);
    this.performanceMetrics.batchesSent++;
    
    console.log(`📦 Processed batch of ${batch.messages.length} messages for client ${batch.clientId}`);
  }

  // ==================== CONNECTION POOLING ====================

  /**
   * Get or create connection from pool
   */
  async getConnection(connectionId, connectionType = 'websocket') {
    const poolKey = `${connectionType}_${connectionId}`;
    
    // Check if connection exists and is valid
    if (this.connectionPool.has(poolKey)) {
      const connection = this.connectionPool.get(poolKey);
      
      if (this.isConnectionValid(connection)) {
        connection.lastUsed = Date.now();
        connection.useCount++;
        return connection;
      } else {
        // Remove invalid connection
        this.connectionPool.delete(poolKey);
      }
    }

    // Create new connection
    const newConnection = await this.createConnection(connectionId, connectionType);
    if (newConnection) {
      this.connectionPool.set(poolKey, newConnection);
      this.performanceMetrics.activeConnections = this.connectionPool.size;
    }

    return newConnection;
  }

  /**
   * Check if connection is still valid
   */
  isConnectionValid(connection) {
    const now = Date.now();
    return (
      connection &&
      connection.isActive &&
      (now - connection.lastUsed) < this.connectionPool.maxIdleTime &&
      (now - connection.created) < this.connectionPool.connectionTimeout
    );
  }

  /**
   * Create new connection
   */
  async createConnection(connectionId, connectionType) {
    try {
      const connection = {
        id: connectionId,
        type: connectionType,
        created: Date.now(),
        lastUsed: Date.now(),
        useCount: 0,
        isActive: true,
        metadata: {}
      };

      console.log(`🔗 Created new ${connectionType} connection: ${connectionId}`);
      return connection;
    } catch (error) {
      console.error(`❌ Failed to create connection ${connectionId}:`, error);
      return null;
    }
  }

  /**
   * Release connection back to pool
   */
  releaseConnection(connectionId, connectionType = 'websocket') {
    const poolKey = `${connectionType}_${connectionId}`;
    const connection = this.connectionPool.get(poolKey);
    
    if (connection) {
      connection.lastUsed = Date.now();
      console.log(`🔄 Released connection ${connectionId} back to pool`);
    }
  }

  /**
   * Close and remove connection from pool
   */
  closeConnection(connectionId, connectionType = 'websocket') {
    const poolKey = `${connectionType}_${connectionId}`;
    const connection = this.connectionPool.get(poolKey);
    
    if (connection) {
      connection.isActive = false;
      this.connectionPool.delete(poolKey);
      this.performanceMetrics.activeConnections = this.connectionPool.size;
      console.log(`🔌 Closed connection ${connectionId}`);
    }
  }

  // ==================== CACHING MECHANISMS ====================

  /**
   * Generate cache key for data
   */
  generateCacheKey(data, type) {
    const hash = createHash('md5');
    hash.update(JSON.stringify(data) + type);
    return hash.digest('hex');
  }

  /**
   * Set cache entry with TTL
   */
  setCache(key, data, ttl = null) {
    const cacheTTL = ttl || this.cacheConfig.defaultTTL;
    
    this.cache.set(key, data);
    this.cacheTimestamps.set(key, Date.now() + cacheTTL);
    
    // Enforce cache size limit
    if (this.cache.size > this.cacheConfig.maxCacheSize) {
      this.evictOldestCacheEntry();
    }
  }

  /**
   * Get cache entry if valid
   */
  getCache(key) {
    const timestamp = this.cacheTimestamps.get(key);
    
    if (!timestamp || Date.now() > timestamp) {
      // Cache entry expired or doesn't exist
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
      this.performanceMetrics.cacheMisses++;
      return null;
    }
    
    this.performanceMetrics.cacheHits++;
    return this.cache.get(key);
  }

  /**
   * Cache consciousness state with short TTL
   */
  cacheConsciousnessState(state) {
    const key = this.generateCacheKey(state, 'consciousness_state');
    this.setCache(key, state, this.cacheConfig.consciousnessStateTTL);
  }

  /**
   * Cache module response
   */
  cacheModuleResponse(moduleName, userMessage, response) {
    const key = this.generateCacheKey({ moduleName, userMessage }, 'module_response');
    this.setCache(key, response, this.cacheConfig.moduleResponseTTL);
  }

  /**
   * Get cached module response
   */
  getCachedModuleResponse(moduleName, userMessage) {
    const key = this.generateCacheKey({ moduleName, userMessage }, 'module_response');
    return this.getCache(key);
  }

  /**
   * Cache user message processing
   */
  cacheUserMessage(userMessage, response) {
    const key = this.generateCacheKey(userMessage, 'user_message');
    this.setCache(key, response, this.cacheConfig.userMessageTTL);
  }

  /**
   * Get cached user message response
   */
  getCachedUserMessage(userMessage) {
    const key = this.generateCacheKey(userMessage, 'user_message');
    return this.getCache(key);
  }

  /**
   * Evict oldest cache entry
   */
  evictOldestCacheEntry() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, timestamp] of this.cacheTimestamps) {
      if (timestamp < oldestTime) {
        oldestTime = timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.cacheTimestamps.delete(oldestKey);
    }
  }

  // ==================== PERFORMANCE MONITORING ====================

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const now = Date.now();
    
    return {
      ...this.performanceMetrics,
      cacheHitRate: this.performanceMetrics.cacheHits / 
        (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) || 0,
      cacheSize: this.cache.size,
      connectionPoolSize: this.connectionPool.size,
      activeBatches: this.messageBatches.size,
      uptime: now - this.startTime
    };
  }

  /**
   * Update performance metrics
   */
  updateMetrics(type, value = 1) {
    switch (type) {
      case 'message_processed':
        this.performanceMetrics.messagesProcessed += value;
        break;
      case 'response_time':
        this.performanceMetrics.averageResponseTime = 
          (this.performanceMetrics.averageResponseTime + value) / 2;
        break;
      case 'cache_hit':
        this.performanceMetrics.cacheHits += value;
        break;
      case 'cache_miss':
        this.performanceMetrics.cacheMisses += value;
        break;
    }
  }

  // ==================== CLEANUP AND MAINTENANCE ====================

  /**
   * Start cleanup intervals
   */
  startCleanupIntervals() {
    // Clean up expired cache entries
    setInterval(() => {
      this.cleanupExpiredCache();
    }, this.config.cleanup.cacheCleanupInterval);

    // Clean up idle connections
    setInterval(() => {
      this.cleanupIdleConnections();
    }, this.config.cleanup.connectionCleanupInterval);

    // Process any remaining batches
    setInterval(() => {
      this.processRemainingBatches();
    }, this.config.cleanup.batchCleanupInterval);

    // Log performance metrics
    if (this.config.monitoring.enabled) {
      setInterval(() => {
        this.logPerformanceMetrics();
      }, this.config.monitoring.loggingInterval);
    }
  }

  /**
   * Clean up expired cache entries
   */
  cleanupExpiredCache() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, timestamp] of this.cacheTimestamps) {
      if (now > timestamp) {
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired cache entries`);
    }
  }

  /**
   * Clean up idle connections
   */
  cleanupIdleConnections() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, connection] of this.connectionPool) {
      if ((now - connection.lastUsed) > this.connectionPool.maxIdleTime) {
        this.connectionPool.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} idle connections`);
      this.performanceMetrics.activeConnections = this.connectionPool.size;
    }
  }

  /**
   * Process any remaining batches
   */
  processRemainingBatches() {
    for (const [batchKey, batch] of this.messageBatches) {
      if (batch.messages.length > 0) {
        this.processBatch(batchKey);
      }
    }
  }

  /**
   * Log performance metrics
   */
  logPerformanceMetrics() {
    const metrics = this.getPerformanceMetrics();
    console.log('📊 Performance Metrics:', {
      messagesProcessed: metrics.messagesProcessed,
      batchesSent: metrics.batchesSent,
      cacheHitRate: (metrics.cacheHitRate * 100).toFixed(2) + '%',
      averageResponseTime: metrics.averageResponseTime.toFixed(2) + 'ms',
      activeConnections: metrics.activeConnections,
      cacheSize: metrics.cacheSize
    });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Optimize message for batching
   */
  optimizeMessage(message, clientId) {
    const messageType = message.type;
    let priority = this.config.batching.messagePriorities[messageType] || 'MEDIUM';
    
    // Add to batch for non-high priority messages
    if (priority !== 'HIGH') {
      this.addToBatch(clientId, message, priority);
      return null; // Return null to indicate message was batched
    }
    
    return message; // Return message for immediate processing
  }

  /**
   * Get optimized connection for client
   */
  async getOptimizedConnection(clientId) {
    return await this.getConnection(clientId, 'websocket');
  }

  /**
   * Shutdown optimizer
   */
  shutdown() {
    // Process any remaining batches
    this.processRemainingBatches();
    
    // Close all connections
    for (const [key, connection] of this.connectionPool) {
      connection.isActive = false;
    }
    this.connectionPool.clear();
    
    // Clear cache
    this.cache.clear();
    this.cacheTimestamps.clear();
    
    console.log('🛑 Performance Optimizer shutdown complete');
  }
}

export default PerformanceOptimizer; 