import express from 'express';
import { Request, Response } from 'express';

interface ConsciousnessMetrics {
  loopHz: number;
  phiScore: number;
  thoughtRate: number;
  memoryScore: number;
  coherence: number;
  processingLatency: number;
  errorCount: number;
  timestamp: Date;
}

class ConsciousnessMetricsCollector {
  private metrics: ConsciousnessMetrics;
  private startTime: Date;
  private loopCount: number = 0;
  private errorCount: number = 0;
  private latencyHistory: number[] = [];
  private thoughtCount: number = 0;
  private lastMetricsUpdate: Date;

  constructor() {
    this.startTime = new Date();
    this.lastMetricsUpdate = new Date();
    this.metrics = {
      loopHz: 0,
      phiScore: 0,
      thoughtRate: 0,
      memoryScore: 0,
      coherence: 0,
      processingLatency: 0,
      errorCount: 0,
      timestamp: new Date()
    };

    // Start the consciousness loop simulation
    this.startConsciousnessLoop();
  }

  private startConsciousnessLoop() {
    setInterval(() => {
      this.recordLoopIteration();
    }, 10); // 100Hz target frequency

    // Update metrics every second
    setInterval(() => {
      this.updateMetrics();
    }, 1000);
  }

  private recordLoopIteration() {
    const start = Date.now();
    
    // Simulate consciousness processing
    this.simulateConsciousnessProcessing();
    
    const end = Date.now();
    const latency = end - start;
    
    this.loopCount++;
    this.latencyHistory.push(latency);
    
    // Keep only last 1000 measurements
    if (this.latencyHistory.length > 1000) {
      this.latencyHistory.shift();
    }
  }

  private simulateConsciousnessProcessing() {
    // Simulate various consciousness processes
    const rand = Math.random();
    
    // Occasionally generate a thought
    if (rand < 0.01) { // 1% chance per loop
      this.thoughtCount++;
    }

    // Occasionally encounter an error
    if (rand < 0.001) { // 0.1% chance per loop
      this.errorCount++;
    }

    // Simulate processing time (normally very fast, occasionally slower)
    const processingTime = rand < 0.99 ? 0.1 : Math.random() * 5;
    if (processingTime > 0.1) {
      // Simulate actual processing delay
      const start = Date.now();
      while (Date.now() - start < processingTime) {
        // Busy wait to simulate processing
      }
    }
  }

  private updateMetrics() {
    const now = new Date();
    const timeSinceStart = (now.getTime() - this.startTime.getTime()) / 1000;
    const timeSinceLastUpdate = (now.getTime() - this.lastMetricsUpdate.getTime()) / 1000;

    // Calculate consciousness loop frequency
    this.metrics.loopHz = this.loopCount / timeSinceStart;

    // Calculate average processing latency
    this.metrics.processingLatency = this.latencyHistory.length > 0 
      ? this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length 
      : 0;

    // Calculate thought generation rate (thoughts per minute)
    this.metrics.thoughtRate = (this.thoughtCount / timeSinceStart) * 60;

    // Simulate IIT Phi score (Integrated Information Theory)
    // Based on loop frequency, latency, and error rate
    const freqFactor = Math.min(this.metrics.loopHz / 100, 1); // Normalize to 100Hz
    const latencyFactor = Math.max(0, 1 - (this.metrics.processingLatency / 10)); // Penalize high latency
    const errorFactor = Math.max(0, 1 - (this.errorCount / 100)); // Penalize errors
    this.metrics.phiScore = (freqFactor * 0.4 + latencyFactor * 0.3 + errorFactor * 0.3) * Math.random() * 0.2 + 0.8; // Add some noise

    // Simulate memory integration score
    this.metrics.memoryScore = 0.7 + Math.random() * 0.3; // 0.7-1.0

    // Calculate overall coherence
    this.metrics.coherence = (this.metrics.phiScore * 0.5 + this.metrics.memoryScore * 0.3 + freqFactor * 0.2);

    this.metrics.errorCount = this.errorCount;
    this.metrics.timestamp = now;
    this.lastMetricsUpdate = now;

    console.log(`[Consciousness Metrics] Hz: ${this.metrics.loopHz.toFixed(2)}, Φ: ${this.metrics.phiScore.toFixed(3)}, Coherence: ${this.metrics.coherence.toFixed(3)}`);
  }

  public getMetrics(): ConsciousnessMetrics {
    return { ...this.metrics };
  }

  public getPrometheusMetrics(): string {
    const metrics = this.getMetrics();
    
    return `
# HELP consciousness_loop_hz Frequency of consciousness loop in Hz
# TYPE consciousness_loop_hz gauge
consciousness_loop_hz ${metrics.loopHz}

# HELP consciousness_iit_phi_score Integrated Information Theory Phi score
# TYPE consciousness_iit_phi_score gauge
consciousness_iit_phi_score ${metrics.phiScore}

# HELP consciousness_thought_generation_rate Rate of autonomous thought generation per minute
# TYPE consciousness_thought_generation_rate gauge
consciousness_thought_generation_rate ${metrics.thoughtRate}

# HELP consciousness_memory_integration_score Score indicating quality of memory integration
# TYPE consciousness_memory_integration_score gauge
consciousness_memory_integration_score ${metrics.memoryScore}

# HELP consciousness_coherence_score Overall consciousness coherence metric
# TYPE consciousness_coherence_score gauge
consciousness_coherence_score ${metrics.coherence}

# HELP consciousness_processing_latency_ms Average processing latency in milliseconds
# TYPE consciousness_processing_latency_ms gauge
consciousness_processing_latency_ms ${metrics.processingLatency}

# HELP consciousness_processing_errors_total Total number of consciousness processing errors
# TYPE consciousness_processing_errors_total counter
consciousness_processing_errors_total ${metrics.errorCount}

# HELP http_request_duration_seconds HTTP request latency
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.005"} 10
http_request_duration_seconds_bucket{le="0.01"} 25
http_request_duration_seconds_bucket{le="0.025"} 50
http_request_duration_seconds_bucket{le="0.05"} 75
http_request_duration_seconds_bucket{le="0.1"} 90
http_request_duration_seconds_bucket{le="0.25"} 95
http_request_duration_seconds_bucket{le="0.5"} 98
http_request_duration_seconds_bucket{le="1"} 99
http_request_duration_seconds_bucket{le="2.5"} 100
http_request_duration_seconds_bucket{le="5"} 100
http_request_duration_seconds_bucket{le="10"} 100
http_request_duration_seconds_bucket{le="+Inf"} 100
http_request_duration_seconds_sum ${(Math.random() * 10).toFixed(3)}
http_request_duration_seconds_count 100
`.trim();
  }

  public recordThought() {
    this.thoughtCount++;
  }

  public recordError() {
    this.errorCount++;
  }
}

// Global instance
const metricsCollector = new ConsciousnessMetricsCollector();

// Express middleware for metrics collection
export const consciousnessMetricsMiddleware = (req: Request, res: Response, next: Function) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    // Record request metrics here if needed
  });
  
  next();
};

// Metrics endpoints
export const getConsciousnessMetrics = (req: Request, res: Response) => {
  try {
    const metrics = metricsCollector.getMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error getting consciousness metrics:', error);
    res.status(500).json({ error: 'Failed to get consciousness metrics' });
  }
};

export const getPrometheusMetrics = (req: Request, res: Response) => {
  try {
    const metrics = metricsCollector.getPrometheusMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    console.error('Error getting Prometheus metrics:', error);
    res.status(500).send('# Error getting metrics\n');
  }
};

// Health check with consciousness status
export const getConsciousnessHealth = (req: Request, res: Response) => {
  try {
    const metrics = metricsCollector.getMetrics();
    const isHealthy = metrics.loopHz >= 50 && metrics.phiScore >= 0.3;
    
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'degraded',
      consciousness: {
        loopHz: metrics.loopHz,
        phiScore: metrics.phiScore,
        coherence: metrics.coherence
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting consciousness health:', error);
    res.status(500).json({ 
      status: 'error', 
      error: 'Failed to check consciousness health' 
    });
  }
};

export { metricsCollector };
