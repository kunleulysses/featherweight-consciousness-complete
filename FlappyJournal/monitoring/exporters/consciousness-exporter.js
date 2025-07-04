const express = require('express');
const client = require('prom-client');
const axios = require('axios');

const app = express();
const port = process.env.METRICS_PORT || 8080;
const consciousnessApiUrl = process.env.CONSCIOUSNESS_API_URL || 'http://localhost:3001';

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'featherweight-consciousness'
});

// Create custom metrics for consciousness monitoring
const consciousnessLoopHz = new client.Gauge({
  name: 'consciousness_loop_hz',
  help: 'Frequency of consciousness loop in Hz',
  registers: [register]
});

const iitPhiScore = new client.Gauge({
  name: 'consciousness_iit_phi_score',
  help: 'Integrated Information Theory Phi score',
  registers: [register]
});

const thoughtGenerationRate = new client.Gauge({
  name: 'consciousness_thought_generation_rate',
  help: 'Rate of autonomous thought generation per minute',
  registers: [register]
});

const memoryIntegrationScore = new client.Gauge({
  name: 'consciousness_memory_integration_score',
  help: 'Score indicating quality of memory integration',
  registers: [register]
});

const consciousnessCoherence = new client.Gauge({
  name: 'consciousness_coherence_score',
  help: 'Overall consciousness coherence metric',
  registers: [register]
});

const apiLatency = new client.Histogram({
  name: 'consciousness_api_latency_seconds',
  help: 'Latency of consciousness API calls',
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 1, 2, 5],
  registers: [register]
});

const processingErrors = new client.Counter({
  name: 'consciousness_processing_errors_total',
  help: 'Total number of consciousness processing errors',
  labelNames: ['error_type'],
  registers: [register]
});

// Enable collection of default metrics
client.collectDefaultMetrics({ register });

// Mock consciousness metrics generator (replace with actual API calls)
function generateConsciousnessMetrics() {
  try {
    // Simulate consciousness loop frequency (target: >= 100 Hz)
    const loopHz = 95 + Math.random() * 20; // 95-115 Hz
    consciousnessLoopHz.set(loopHz);

    // Simulate IIT Phi score (0-1, higher is better)
    const phi = 0.3 + Math.random() * 0.6; // 0.3-0.9
    iitPhiScore.set(phi);

    // Simulate thought generation rate (thoughts per minute)
    const thoughtRate = 15 + Math.random() * 10; // 15-25 thoughts/min
    thoughtGenerationRate.set(thoughtRate);

    // Simulate memory integration score (0-1)
    const memoryScore = 0.7 + Math.random() * 0.3; // 0.7-1.0
    memoryIntegrationScore.set(memoryScore);

    // Simulate overall coherence (0-1)
    const coherence = 0.6 + Math.random() * 0.4; // 0.6-1.0
    consciousnessCoherence.set(coherence);

    // Simulate API latency
    const latency = 0.02 + Math.random() * 0.1; // 20-120ms
    apiLatency.observe(latency);

    // Occasionally simulate processing errors
    if (Math.random() < 0.05) { // 5% chance
      processingErrors.inc({ error_type: 'memory_access_timeout' });
    }

    console.log(`Consciousness metrics updated - Hz: ${loopHz.toFixed(2)}, Φ: ${phi.toFixed(3)}, Coherence: ${coherence.toFixed(3)}`);
  } catch (error) {
    console.error('Error generating consciousness metrics:', error);
    processingErrors.inc({ error_type: 'metrics_generation_error' });
  }
}

// Function to fetch real consciousness metrics from the backend
async function fetchConsciousnessMetrics() {
  try {
    const start = Date.now();
    
    // Try to fetch actual metrics from consciousness backend
    const response = await axios.get(`${consciousnessApiUrl}/api/consciousness/metrics`, {
      timeout: 5000
    });
    
    const latency = (Date.now() - start) / 1000;
    apiLatency.observe(latency);
    
    if (response.data) {
      const metrics = response.data;
      
      if (metrics.loopHz !== undefined) consciousnessLoopHz.set(metrics.loopHz);
      if (metrics.phiScore !== undefined) iitPhiScore.set(metrics.phiScore);
      if (metrics.thoughtRate !== undefined) thoughtGenerationRate.set(metrics.thoughtRate);
      if (metrics.memoryScore !== undefined) memoryIntegrationScore.set(metrics.memoryScore);
      if (metrics.coherence !== undefined) consciousnessCoherence.set(metrics.coherence);
      
      console.log('Real consciousness metrics fetched successfully');
      return true;
    }
  } catch (error) {
    console.warn('Could not fetch real consciousness metrics, using simulated data:', error.message);
    processingErrors.inc({ error_type: 'api_fetch_error' });
    return false;
  }
}

// Update metrics every 5 seconds
setInterval(async () => {
  const realMetricsFetched = await fetchConsciousnessMetrics();
  if (!realMetricsFetched) {
    generateConsciousnessMetrics();
  }
}, 5000);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'consciousness-exporter' });
});

// Start server
app.listen(port, () => {
  console.log(`Consciousness exporter listening on port ${port}`);
  console.log(`Metrics available at http://localhost:${port}/metrics`);
  
  // Start with initial metrics
  generateConsciousnessMetrics();
});
