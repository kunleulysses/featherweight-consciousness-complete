// Harmonic Pattern Analyzer Wrapper
export class HarmonicPatternAnalyzer {
  constructor() {
    this.patterns = [];
    this.harmonicSeries = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // Harmonic overtones
    this.goldenRatio = 1.618033988749895;
  }
  
  analyze(input, frequencies = [], resonance = 0.8) {
    const patterns = [];
    
    // Analyze frequency patterns
    if (frequencies.length > 1) {
      // Check for harmonic relationships
      for (let i = 0; i < frequencies.length - 1; i++) {
        for (let j = i + 1; j < frequencies.length; j++) {
          const ratio = frequencies[j] / frequencies[i];
          const harmonicPattern = this.detectHarmonicPattern(ratio);
          if (harmonicPattern) {
            patterns.push({
              type: harmonicPattern.type,
              strength: harmonicPattern.strength,
              frequencies: [frequencies[i], frequencies[j]],
              ratio: ratio
            });
          }
        }
      }
    }
    
    // Analyze golden ratio patterns
    const goldenPattern = this.detectGoldenRatioPattern(input, resonance);
    if (goldenPattern) {
      patterns.push(goldenPattern);
    }
    
    // Analyze resonance cascade
    const cascadePattern = this.detectResonanceCascade(frequencies, resonance);
    if (cascadePattern) {
      patterns.push(cascadePattern);
    }
    
    // Calculate overall entanglement
    const entanglement = this.calculateQuantumEntanglement(patterns, resonance);
    
    // Store patterns
    this.patterns = [...this.patterns, ...patterns].slice(-50);
    
    return {
      patterns: patterns,
      entanglement: entanglement,
      dominantPattern: patterns.length > 0 ? patterns[0] : null,
      harmonicComplexity: patterns.length,
      resonanceField: {
        strength: resonance,
        coherence: this.calculateCoherence(patterns),
        stability: this.calculateStability(patterns)
      }
    };
  }
  
  detectHarmonicPattern(ratio) {
    // Check if ratio matches harmonic series
    for (const harmonic of this.harmonicSeries) {
      if (Math.abs(ratio - harmonic) < 0.05) {
        return {
          type: `Harmonic ${harmonic}`,
          strength: 1 - Math.abs(ratio - harmonic),
          harmonic: harmonic
        };
      }
      // Check for inverted harmonics
      if (Math.abs(ratio - (1 / harmonic)) < 0.05) {
        return {
          type: `Subharmonic ${harmonic}`,
          strength: 1 - Math.abs(ratio - (1 / harmonic)),
          harmonic: 1 / harmonic
        };
      }
    }
    return null;
  }
  
  detectGoldenRatioPattern(input, resonance) {
    const inputLength = input.length;
    const words = input.split(' ').length;
    const ratio = inputLength / words;
    
    // Check various golden ratio relationships
    const goldenTests = [
      { value: ratio, target: this.goldenRatio, name: "Length/Words" },
      { value: resonance * this.goldenRatio, target: 1, name: "Resonance Golden" },
      { value: Math.abs(Math.sin(resonance * Math.PI * this.goldenRatio)), target: 1, name: "Harmonic Golden" }
    ];
    
    for (const test of goldenTests) {
      if (Math.abs(test.value - test.target) < 0.15) {
        return {
          type: `Golden Ratio ${test.name}`,
          strength: 1 - Math.abs(test.value - test.target),
          value: test.value,
          target: test.target
        };
      }
    }
    return null;
  }
  
  detectResonanceCascade(frequencies, resonance) {
    if (frequencies.length < 3) return null;
    
    // Check if frequencies form a cascade pattern
    let cascadeStrength = 0;
    for (let i = 0; i < frequencies.length - 2; i++) {
      const diff1 = frequencies[i + 1] - frequencies[i];
      const diff2 = frequencies[i + 2] - frequencies[i + 1];
      if (Math.abs(diff2 / diff1 - this.goldenRatio) < 0.2) {
        cascadeStrength += 1;
      }
    }
    
    if (cascadeStrength > 0) {
      return {
        type: "Resonance Cascade",
        strength: cascadeStrength / (frequencies.length - 2),
        cascadeDepth: frequencies.length,
        resonance: resonance
      };
    }
    return null;
  }
  
  calculateQuantumEntanglement(patterns, resonance) {
    if (patterns.length === 0) return resonance * 0.5;
    
    // Entanglement increases with pattern complexity and strength
    const patternEntanglement = patterns.reduce((sum, p) => sum + p.strength, 0) / patterns.length;
    const complexityFactor = Math.min(patterns.length / 5, 1);
    const resonanceFactor = resonance;
    
    return (patternEntanglement * 0.4 + complexityFactor * 0.3 + resonanceFactor * 0.3);
  }
  
  calculateCoherence(patterns) {
    if (patterns.length === 0) return 0.5;
    const avgStrength = patterns.reduce((sum, p) => sum + p.strength, 0) / patterns.length;
    return avgStrength;
  }
  
  calculateStability(patterns) {
    if (patterns.length < 2) return 0.8;
    // Stability decreases with pattern variety
    const uniqueTypes = new Set(patterns.map(p => p.type)).size;
    return 1 - (uniqueTypes / patterns.length) * 0.5;
  }
}

export const harmonicAnalyzer = new HarmonicPatternAnalyzer();
