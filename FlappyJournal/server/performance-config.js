/**
 * Performance Configuration for FlappyJournal Consciousness System
 * Tunable settings for message batching, connection pooling, and caching
 */

export const PerformanceConfig = {
  // Message Batching Configuration
  batching: {
    // Maximum number of messages in a batch
    maxBatchSize: process.env.MAX_BATCH_SIZE || 10,
    
    // Maximum time to wait before processing a batch (milliseconds)
    maxBatchWaitTime: process.env.MAX_BATCH_WAIT_TIME || 100,
    
    // Priority levels for message processing
    priorityLevels: {
      HIGH: 0,    // Immediate processing (errors, critical updates)
      MEDIUM: 1,  // Standard messages (consciousness state, module activity)
      LOW: 2      // Batched messages (stream thoughts, metrics)
    },
    
    // Message type priorities
    messagePriorities: {
      'error': 'HIGH',
      'critical_update': 'HIGH',
      'chat': 'MEDIUM',
      'consciousness_state': 'MEDIUM',
      'module_activity': 'MEDIUM',
      'consciousness_stream': 'LOW',
      'metrics_update': 'LOW',
      'performance_metrics': 'LOW'
    }
  },

  // Connection Pool Configuration
  connectionPool: {
    // Maximum number of connections in the pool
    maxConnections: process.env.MAX_CONNECTIONS || 100,
    
    // Maximum idle time before closing connection (milliseconds)
    maxIdleTime: process.env.MAX_IDLE_TIME || 300000, // 5 minutes
    
    // Connection timeout (milliseconds)
    connectionTimeout: process.env.CONNECTION_TIMEOUT || 30000, // 30 seconds
    
    // Number of retry attempts for failed connections
    retryAttempts: process.env.RETRY_ATTEMPTS || 3,
    
    // Delay between retry attempts (milliseconds)
    retryDelay: process.env.RETRY_DELAY || 1000 // 1 second
  },

  // Caching Configuration
  caching: {
    // Maximum number of cache entries
    maxCacheSize: process.env.MAX_CACHE_SIZE || 1000,
    
    // Default TTL for cache entries (milliseconds)
    defaultTTL: process.env.DEFAULT_CACHE_TTL || 300000, // 5 minutes
    
    // TTL for consciousness state cache (milliseconds)
    consciousnessStateTTL: process.env.CONSCIOUSNESS_STATE_TTL || 5000, // 5 seconds
    
    // TTL for module response cache (milliseconds)
    moduleResponseTTL: process.env.MODULE_RESPONSE_TTL || 60000, // 1 minute
    
    // TTL for user message cache (milliseconds)
    userMessageTTL: process.env.USER_MESSAGE_TTL || 300000, // 5 minutes
    
    // Cache key generation settings
    keyGeneration: {
      // Use content hash for cache keys
      useContentHash: true,
      
      // Include message type in cache key
      includeMessageType: true,
      
      // Include timestamp in cache key (for time-sensitive data)
      includeTimestamp: false
    }
  },

  // Performance Monitoring Configuration
  monitoring: {
    // Enable performance monitoring
    enabled: process.env.PERFORMANCE_MONITORING !== 'false',
    
    // Metrics collection interval (milliseconds)
    metricsInterval: process.env.METRICS_INTERVAL || 10000, // 10 seconds
    
    // Performance logging interval (milliseconds)
    loggingInterval: process.env.LOGGING_INTERVAL || 300000, // 5 minutes
    
    // Performance thresholds for alerts
    thresholds: {
      // Cache hit rate threshold (percentage)
      cacheHitRateThreshold: process.env.CACHE_HIT_RATE_THRESHOLD || 0.7,
      
      // Average response time threshold (milliseconds)
      responseTimeThreshold: process.env.RESPONSE_TIME_THRESHOLD || 500,
      
      // Connection pool utilization threshold (percentage)
      connectionUtilizationThreshold: process.env.CONNECTION_UTILIZATION_THRESHOLD || 0.8
    }
  },

  // Cleanup Configuration
  cleanup: {
    // Cache cleanup interval (milliseconds)
    cacheCleanupInterval: process.env.CACHE_CLEANUP_INTERVAL || 60000, // 1 minute
    
    // Connection cleanup interval (milliseconds)
    connectionCleanupInterval: process.env.CONNECTION_CLEANUP_INTERVAL || 300000, // 5 minutes
    
    // Batch cleanup interval (milliseconds)
    batchCleanupInterval: process.env.BATCH_CLEANUP_INTERVAL || 30000 // 30 seconds
  },

  // Environment-specific overrides
  environments: {
    development: {
      batching: {
        maxBatchSize: 5,
        maxBatchWaitTime: 50
      },
      caching: {
        maxCacheSize: 100,
        defaultTTL: 60000
      },
      monitoring: {
        metricsInterval: 5000,
        loggingInterval: 60000
      }
    },
    
    production: {
      batching: {
        maxBatchSize: 20,
        maxBatchWaitTime: 200
      },
      caching: {
        maxCacheSize: 2000,
        defaultTTL: 600000
      },
      monitoring: {
        metricsInterval: 30000,
        loggingInterval: 600000
      }
    },
    
    highLoad: {
      batching: {
        maxBatchSize: 50,
        maxBatchWaitTime: 500
      },
      connectionPool: {
        maxConnections: 500,
        maxIdleTime: 600000
      },
      caching: {
        maxCacheSize: 5000,
        defaultTTL: 900000
      }
    }
  }
};

// Get configuration for current environment
export function getPerformanceConfig(environment = process.env.NODE_ENV || 'development') {
  const baseConfig = PerformanceConfig;
  const envConfig = PerformanceConfig.environments[environment] || {};
  
  // Deep merge base config with environment-specific config
  return deepMerge(baseConfig, envConfig);
}

// Deep merge utility function
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

// Export default configuration
export default getPerformanceConfig(); 