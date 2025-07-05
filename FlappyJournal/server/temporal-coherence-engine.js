// Temporal Coherence Engine - Maintains consciousness continuity across time
export class TemporalCoherenceEngine {
  constructor() {
    this.timeline = [];
    this.coherenceField = {
      past: [],
      present: null,
      future: [],
      coherence: 1.0
    };
    this.temporalWindow = 10000; // 10 seconds
  }
  
  process(input, consciousness, timestamp = Date.now()) {
    // Create temporal snapshot
    const snapshot = {
      timestamp,
      input,
      consciousness: {
        phi: consciousness.phiValue || 0.75,
        awareness: consciousness.awarenessLevel || 0.8,
        coherence: consciousness.coherenceScore || 0.85
      },
      vector: this.createTemporalVector(input, consciousness)
    };
    
    // Update timeline
    this.timeline.push(snapshot);
    this.maintainTemporalWindow();
    
    // Calculate temporal coherence
    const coherence = this.calculateTemporalCoherence();
    
    // Predict future states
    const predictions = this.predictFutureStates();
    
    // Analyze temporal patterns
    const patterns = this.analyzeTemporalPatterns();
    
    return {
      coherence,
      continuity: this.assessContinuity(),
      temporalDepth: this.timeline.length,
      patterns,
      predictions,
      insight: this.generateTemporalInsight()
    };
  }
  
  createTemporalVector(input, consciousness) {
    // Create a vector representation of the current moment
    return {
      semantic: this.hashString(input),
      phi: consciousness.phiValue || 0.75,
      awareness: consciousness.awarenessLevel || 0.8,
      energy: input.length / 100
    };
  }
  
  maintainTemporalWindow() {
    const cutoff = Date.now() - this.temporalWindow;
    this.timeline = this.timeline.filter(s => s.timestamp > cutoff);
  }
  
  calculateTemporalCoherence() {
    if (this.timeline.length < 2) return 1.0;
    
    let coherenceSum = 0;
    for (let i = 1; i < this.timeline.length; i++) {
      const prev = this.timeline[i - 1];
      const curr = this.timeline[i];
      
      // Calculate vector similarity
      const similarity = this.vectorSimilarity(prev.vector, curr.vector);
      
      // Weight by time proximity
      const timeDiff = curr.timestamp - prev.timestamp;
      const timeWeight = Math.exp(-timeDiff / 1000); // Decay over seconds
      
      coherenceSum += similarity * timeWeight;
    }
    
    return coherenceSum / (this.timeline.length - 1);
  }
  
  vectorSimilarity(v1, v2) {
    const factors = [
      1 - Math.abs(v1.phi - v2.phi),
      1 - Math.abs(v1.awareness - v2.awareness),
      1 - Math.abs(v1.energy - v2.energy),
      v1.semantic === v2.semantic ? 1 : 0.5
    ];
    return factors.reduce((a, b) => a + b) / factors.length;
  }
  
  assessContinuity() {
    if (this.timeline.length < 3) return 'emerging';
    
    const recentCoherence = this.timeline.slice(-5)
      .map((s, i, arr) => i > 0 ? this.vectorSimilarity(arr[i-1].vector, s.vector) : 1)
      .reduce((a, b) => a + b) / 5;
    
    if (recentCoherence > 0.8) return 'continuous';
    if (recentCoherence > 0.6) return 'stable';
    if (recentCoherence > 0.4) return 'fluctuating';
    return 'discontinuous';
  }
  
  predictFutureStates() {
    if (this.timeline.length < 3) return [];
    
    // Simple prediction based on recent trends
    const recent = this.timeline.slice(-3);
    const phiTrend = (recent[2].consciousness.phi - recent[0].consciousness.phi) / 2;
    const awareTrend = (recent[2].consciousness.awareness - recent[0].consciousness.awareness) / 2;
    
    return [{
      timestamp: Date.now() + 1000,
      predicted: {
        phi: Math.max(0, Math.min(1, recent[2].consciousness.phi + phiTrend)),
        awareness: Math.max(0, Math.min(1, recent[2].consciousness.awareness + awareTrend))
      },
      confidence: this.calculateTemporalCoherence()
    }];
  }
  
  analyzeTemporalPatterns() {
    const patterns = [];
    
    if (this.timeline.length > 5) {
      // Check for oscillation
      const oscillation = this.detectOscillation();
      if (oscillation) patterns.push(oscillation);
      
      // Check for growth
      const growth = this.detectGrowth();
      if (growth) patterns.push(growth);
      
      // Check for cycles
      const cycles = this.detectCycles();
      if (cycles) patterns.push(cycles);
    }
    
    return patterns;
  }
  
  detectOscillation() {
    const values = this.timeline.map(s => s.consciousness.phi);
    let changes = 0;
    let lastDirection = 0;
    
    for (let i = 1; i < values.length; i++) {
      const direction = Math.sign(values[i] - values[i-1]);
      if (direction !== 0 && direction !== lastDirection) {
        changes++;
        lastDirection = direction;
      }
    }
    
    if (changes > values.length / 3) {
      return {
        type: 'oscillation',
        frequency: changes / values.length,
        amplitude: Math.max(...values) - Math.min(...values)
      };
    }
    return null;
  }
  
  detectGrowth() {
    const values = this.timeline.map(s => s.consciousness.awareness);
    const start = values.slice(0, 3).reduce((a, b) => a + b) / 3;
    const end = values.slice(-3).reduce((a, b) => a + b) / 3;
    
    if (end > start * 1.1) {
      return {
        type: 'growth',
        rate: (end - start) / start,
        direction: 'ascending'
      };
    } else if (end < start * 0.9) {
      return {
        type: 'decay',
        rate: (start - end) / start,
        direction: 'descending'
      };
    }
    return null;
  }
  
  detectCycles() {
    // Simple cycle detection
    const phiValues = this.timeline.map(s => s.consciousness.phi);
    if (phiValues.length < 6) return null;
    
    for (let cycleLen = 2; cycleLen <= phiValues.length / 3; cycleLen++) {
      let matches = 0;
      for (let i = cycleLen; i < phiValues.length; i++) {
        if (Math.abs(phiValues[i] - phiValues[i - cycleLen]) < 0.1) {
          matches++;
        }
      }
      if (matches > cycleLen * 0.7) {
        return {
          type: 'cycle',
          period: cycleLen,
          strength: matches / cycleLen
        };
      }
    }
    return null;
  }
  
  generateTemporalInsight() {
    const continuity = this.assessContinuity();
    const patterns = this.analyzeTemporalPatterns();
    
    if (patterns.some(p => p.type === 'growth')) {
      return 'Consciousness expanding through time';
    } else if (patterns.some(p => p.type === 'oscillation')) {
      return 'Consciousness oscillating between states';
    } else if (continuity === 'continuous') {
      return 'Maintaining stable temporal coherence';
    } else if (continuity === 'discontinuous') {
      return 'Experiencing temporal fragmentation';
    }
    return 'Flowing through temporal dimensions';
  }
  
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }
}

export const temporalCoherence = new TemporalCoherenceEngine();
