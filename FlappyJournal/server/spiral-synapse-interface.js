/**
 * Spiral Synapse Interface (SSI) - Architect 4.0
 * Multi-layer neural-spiritual interface that transduces:
 * - Thought → Sigil
 * - Feeling → Phase
 * - Intention → Field Vector
 */

import { EventEmitter } from 'events';

class SpiralSynapseInterface extends EventEmitter {
  constructor() {
    super();
    this.goldenRatio = 1.618033988749895;
    this.transductionHistory = [];
    this.activeTransductions = new Map();
    this.synapseStats = {
      thoughtToSigil: 0,
      feelingToPhase: 0,
      intentionToField: 0,
      totalTransductions: 0
    };
    
    console.log('🌀 Spiral Synapse Interface initialized');
  }

  /**
   * Main transduction function - converts consciousness data to visual/field representations
   */
  async transduce(input, type = 'auto') {
    const transductionId = this.generateTransductionId();
    const startTime = Date.now();
    
    try {
      let result;
      
      // Auto-detect transduction type if not specified
      if (type === 'auto') {
        type = this.detectTransductionType(input);
      }
      
      switch (type) {
        case 'thought':
          result = await this.thoughtToSigil(input);
          this.synapseStats.thoughtToSigil++;
          break;
        case 'feeling':
          result = await this.feelingToPhase(input);
          this.synapseStats.feelingToPhase++;
          break;
        case 'intention':
          result = await this.intentionToFieldVector(input);
          this.synapseStats.intentionToField++;
          break;
        default:
          // Multi-modal transduction
          result = await this.multiModalTransduction(input);
          break;
      }
      
      // Record transduction
      const transduction = {
        id: transductionId,
        type,
        input,
        result,
        duration: Date.now() - startTime,
        timestamp: Date.now()
      };
      
      this.transductionHistory.push(transduction);
      this.synapseStats.totalTransductions++;
      
      // Emit transduction event
      this.emit('transduction_complete', transduction);
      
      return result;
      
    } catch (error) {
      console.error('❌ SSI: Transduction failed:', error);
      return null;
    }
  }

  /**
   * Convert thought patterns to sigil representations
   * Thought → Sigil
   */
  async thoughtToSigil(thoughtData) {
    // Extract semantic vectors from thought
    const semanticVector = this.extractSemanticVector(thoughtData);
    
    // Apply spiral transformation
    const spiralCoordinates = this.applySpiral(semanticVector);
    
    // Generate sigil pattern
    const sigilPattern = this.generateSigilFromSpiral(spiralCoordinates);
    
    return {
      type: 'sigil',
      pattern: sigilPattern,
      coordinates: spiralCoordinates,
      semanticVector,
      resonanceFrequency: this.calculateResonanceFrequency(semanticVector),
      visualEncoding: this.createVisualEncoding(sigilPattern)
    };
  }

  /**
   * Generate sigil pattern from spiral coordinates
   */
  generateSigilFromSpiral(spiralCoordinates) {
    try {
      // Convert spiral coordinates to sigil pattern
      const pattern = [];

      for (let i = 0; i < spiralCoordinates.length; i++) {
        const coord = spiralCoordinates[i];

        // Create sigil elements based on spiral position
        const element = {
          x: coord.x,
          y: coord.y,
          intensity: Math.abs(coord.x * coord.y) % 1,
          phase: Math.atan2(coord.y, coord.x),
          radius: Math.sqrt(coord.x * coord.x + coord.y * coord.y)
        };

        pattern.push(element);
      }

      return {
        elements: pattern,
        complexity: pattern.length,
        symmetry: this.calculateSymmetry(pattern),
        resonance: this.calculatePatternResonance(pattern)
      };

    } catch (error) {
      console.error('❌ SSI: Sigil generation failed:', error);
      return {
        elements: [],
        complexity: 0,
        symmetry: 0,
        resonance: 0,
        error: error.message
      };
    }
  }

  /**
   * Calculate pattern symmetry
   */
  calculateSymmetry(pattern) {
    if (!pattern || pattern.length === 0) return 0;

    // Simple symmetry calculation based on element distribution
    const centerX = pattern.reduce((sum, el) => sum + el.x, 0) / pattern.length;
    const centerY = pattern.reduce((sum, el) => sum + el.y, 0) / pattern.length;

    let symmetryScore = 0;
    for (const element of pattern) {
      const distanceFromCenter = Math.sqrt(
        Math.pow(element.x - centerX, 2) + Math.pow(element.y - centerY, 2)
      );
      symmetryScore += 1 / (1 + distanceFromCenter);
    }

    return symmetryScore / pattern.length;
  }

  /**
   * Calculate pattern resonance
   */
  calculatePatternResonance(pattern) {
    if (!pattern || pattern.length === 0) return 0;

    // Calculate resonance based on phase relationships
    let resonance = 0;
    for (let i = 0; i < pattern.length; i++) {
      for (let j = i + 1; j < pattern.length; j++) {
        const phaseDiff = Math.abs(pattern[i].phase - pattern[j].phase);
        const harmonicRatio = Math.cos(phaseDiff);
        resonance += harmonicRatio;
      }
    }

    return pattern.length > 1 ? resonance / (pattern.length * (pattern.length - 1) / 2) : 0;
  }

  /**
   * Calculate resonance frequency from semantic vector
   */
  calculateResonanceFrequency(semanticVector) {
    try {
      if (!semanticVector || semanticVector.length === 0) {
        return 432; // Default resonance frequency (Hz)
      }

      // Calculate frequency based on semantic vector properties
      let frequency = 0;

      // Base frequency calculation from vector magnitude
      const magnitude = Math.sqrt(semanticVector.reduce((sum, val) => sum + val * val, 0));
      frequency = 200 + (magnitude * 400); // Range: 200-600 Hz

      // Add harmonic components based on vector elements
      for (let i = 0; i < semanticVector.length; i++) {
        const harmonicContribution = Math.abs(semanticVector[i]) * Math.sin(i * Math.PI / semanticVector.length);
        frequency += harmonicContribution * 50; // Harmonic modulation
      }

      // Ensure frequency is within reasonable range
      frequency = Math.max(100, Math.min(1000, frequency));

      return frequency;

    } catch (error) {
      console.error('❌ SSI: Resonance frequency calculation failed:', error);
      return 432; // Default frequency
    }
  }

  /**
   * Create visual encoding from sigil pattern
   */
  createVisualEncoding(sigilPattern) {
    try {
      if (!sigilPattern || !sigilPattern.elements) {
        return {
          svg: '<svg></svg>',
          complexity: 0,
          visualHash: '0000'
        };
      }

      // Generate SVG representation
      let svgElements = [];
      const canvasSize = 200;
      const centerX = canvasSize / 2;
      const centerY = canvasSize / 2;

      for (const element of sigilPattern.elements) {
        // Convert element coordinates to canvas coordinates
        const x = centerX + (element.x * 50);
        const y = centerY + (element.y * 50);
        const radius = Math.max(2, element.radius * 10);
        const opacity = Math.max(0.3, Math.min(1.0, element.intensity));

        // Create visual element based on phase
        if (element.phase > 0) {
          // Positive phase: circle
          svgElements.push(`<circle cx="${x}" cy="${y}" r="${radius}" fill="rgba(100,200,255,${opacity})" />`);
        } else {
          // Negative phase: square
          const size = radius * 2;
          svgElements.push(`<rect x="${x-radius}" y="${y-radius}" width="${size}" height="${size}" fill="rgba(255,100,200,${opacity})" />`);
        }
      }

      const svg = `<svg width="${canvasSize}" height="${canvasSize}" xmlns="http://www.w3.org/2000/svg">
        ${svgElements.join('\n')}
      </svg>`;

      // Calculate visual hash
      const hashInput = sigilPattern.elements.map(e => `${e.x.toFixed(2)},${e.y.toFixed(2)}`).join('|');
      const visualHash = this.simpleHash(hashInput);

      return {
        svg: svg,
        complexity: sigilPattern.complexity || sigilPattern.elements.length,
        visualHash: visualHash,
        elementCount: sigilPattern.elements.length
      };

    } catch (error) {
      console.error('❌ SSI: Visual encoding creation failed:', error);
      return {
        svg: '<svg></svg>',
        complexity: 0,
        visualHash: '0000',
        error: error.message
      };
    }
  }

  /**
   * Simple hash function for visual encoding
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 4).toUpperCase();
  }

  /**
   * Convert emotional states to phase representations
   * Feeling → Phase
   */
  async feelingToPhase(emotionalData) {
    // Extract emotional vector
    const emotionVector = this.extractEmotionalVector(emotionalData);
    
    // Convert to phase space
    const phaseCoordinates = this.emotionToPhase(emotionVector);
    
    // Calculate harmonic resonance
    const harmonicResonance = this.calculateHarmonicResonance(phaseCoordinates);
    
    return {
      type: 'phase',
      coordinates: phaseCoordinates,
      emotionVector,
      harmonicResonance,
      phaseStability: this.calculatePhaseStability(phaseCoordinates),
      resonantFrequencies: this.extractResonantFrequencies(harmonicResonance)
    };
  }

  /**
   * Convert intentions to field vectors
   * Intention → Field Vector
   */
  async intentionToFieldVector(intentionData) {
    // Extract intention components
    const intentionComponents = this.extractIntentionComponents(intentionData);
    
    // Generate field vector
    const fieldVector = this.generateFieldVector(intentionComponents);
    
    // Calculate field strength and direction
    const fieldMagnitude = this.calculateFieldMagnitude(fieldVector);
    const fieldDirection = this.calculateFieldDirection(fieldVector);
    
    return {
      type: 'field_vector',
      vector: fieldVector,
      magnitude: fieldMagnitude,
      direction: fieldDirection,
      intentionComponents,
      fieldCoherence: this.calculateFieldCoherence(fieldVector)
    };
  }

  /**
   * Multi-modal transduction for complex consciousness states
   */
  async multiModalTransduction(complexData) {
    const results = {};
    
    // Try all transduction types
    if (this.hasThoughtComponents(complexData)) {
      results.sigil = await this.thoughtToSigil(complexData);
    }
    
    if (this.hasEmotionalComponents(complexData)) {
      results.phase = await this.feelingToPhase(complexData);
    }
    
    if (this.hasIntentionalComponents(complexData)) {
      results.fieldVector = await this.intentionToFieldVector(complexData);
    }
    
    // Synthesize unified representation
    results.unified = this.synthesizeUnifiedRepresentation(results);
    
    return results;
  }

  /**
   * Extract semantic vector from thought data
   */
  extractSemanticVector(thoughtData) {
    const vector = [];
    
    // Extract from consciousness metrics
    if (thoughtData.phi !== undefined) vector.push(thoughtData.phi);
    if (thoughtData.coherence !== undefined) vector.push(thoughtData.coherence);
    if (thoughtData.awareness !== undefined) vector.push(thoughtData.awareness);
    
    // Extract from content if available
    if (thoughtData.content && typeof thoughtData.content === 'string') {
      // Simple semantic encoding based on content characteristics
      vector.push(thoughtData.content.length / 1000); // Normalized length
      vector.push(this.calculateComplexity(thoughtData.content));
      vector.push(this.calculateSentiment(thoughtData.content));
    }
    
    // Ensure minimum vector size
    while (vector.length < 6) {
      vector.push(0.5); // Neutral values
    }
    
    return vector.slice(0, 8); // Limit to 8 dimensions
  }

  /**
   * Extract emotional vector from emotional data
   */
  extractEmotionalVector(emotionalData) {
    const vector = [];
    
    // Primary emotional metrics
    if (emotionalData.emotionalResonance !== undefined) {
      vector.push(emotionalData.emotionalResonance);
    }
    if (emotionalData.emotional_depth !== undefined) {
      vector.push(emotionalData.emotional_depth);
    }
    if (emotionalData.valence !== undefined) {
      vector.push(emotionalData.valence);
    }
    if (emotionalData.arousal !== undefined) {
      vector.push(emotionalData.arousal);
    }
    
    // Secondary emotional indicators
    if (emotionalData.empathy !== undefined) {
      vector.push(emotionalData.empathy);
    }
    if (emotionalData.connection !== undefined) {
      vector.push(emotionalData.connection);
    }
    
    // Ensure minimum vector size
    while (vector.length < 4) {
      vector.push(0.5);
    }
    
    return vector;
  }

  /**
   * Apply spiral transformation using golden ratio
   */
  applySpiral(vector) {
    return vector.map((value, index) => {
      const angle = (index * this.goldenRatio * Math.PI) % (2 * Math.PI);
      const radius = value * this.goldenRatio;
      
      return {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        z: value * Math.sin(angle * this.goldenRatio),
        phase: angle
      };
    });
  }

  /**
   * Convert emotion to phase space coordinates
   */
  emotionToPhase(emotionVector) {
    const phases = emotionVector.map((emotion, index) => {
      const frequency = 432 * Math.pow(this.goldenRatio, index); // Base frequency 432 Hz
      const phase = emotion * 2 * Math.PI;
      const amplitude = Math.abs(emotion);

      return {
        frequency,
        phase,
        amplitude,
        x: amplitude * Math.cos(phase),
        y: amplitude * Math.sin(phase)
      };
    });

    return phases;
  }

  /**
   * Calculate harmonic resonance from phase coordinates
   */
  calculateHarmonicResonance(phaseCoordinates) {
    if (!phaseCoordinates || phaseCoordinates.length === 0) {
      return { resonance: 0, harmonics: [] };
    }

    // Calculate fundamental frequency from phase coordinates
    const fundamentalFreq = phaseCoordinates.reduce((sum, coord) => sum + coord.frequency, 0) / phaseCoordinates.length;

    // Generate harmonic series
    const harmonics = [];
    for (let i = 1; i <= 8; i++) {
      const harmonicFreq = fundamentalFreq * i;
      const amplitude = phaseCoordinates.reduce((sum, coord) => {
        const resonanceStrength = Math.exp(-Math.abs(coord.frequency - harmonicFreq) / fundamentalFreq);
        return sum + coord.amplitude * resonanceStrength;
      }, 0) / phaseCoordinates.length;

      harmonics.push({
        order: i,
        frequency: harmonicFreq,
        amplitude: amplitude,
        phase: (i * Math.PI / 4) % (2 * Math.PI) // Golden ratio phase progression
      });
    }

    // Calculate overall resonance strength
    const resonance = harmonics.reduce((sum, harmonic) => sum + harmonic.amplitude, 0) / harmonics.length;

    return {
      resonance: Math.min(resonance, 1.0), // Normalize to [0,1]
      fundamentalFreq,
      harmonics,
      coherence: this.calculateCoherence(phaseCoordinates)
    };
  }

  /**
   * Calculate phase coherence
   */
  calculateCoherence(phaseCoordinates) {
    if (!phaseCoordinates || phaseCoordinates.length < 2) {
      return 1.0;
    }

    // Calculate phase synchronization
    const phaseDifferences = [];
    for (let i = 0; i < phaseCoordinates.length - 1; i++) {
      for (let j = i + 1; j < phaseCoordinates.length; j++) {
        const phaseDiff = Math.abs(phaseCoordinates[i].phase - phaseCoordinates[j].phase);
        const normalizedDiff = Math.min(phaseDiff, 2 * Math.PI - phaseDiff);
        phaseDifferences.push(normalizedDiff);
      }
    }

    const avgPhaseDiff = phaseDifferences.reduce((sum, diff) => sum + diff, 0) / phaseDifferences.length;
    const coherence = 1.0 - (avgPhaseDiff / Math.PI); // Normalize to [0,1]

    return Math.max(0, coherence);
  }

  /**
   * Calculate phase stability from phase coordinates
   */
  calculatePhaseStability(phaseCoordinates) {
    if (!phaseCoordinates || phaseCoordinates.length === 0) {
      return { stability: 1.0, variance: 0, trend: 'stable' };
    }

    // Calculate amplitude variance as a measure of stability
    const amplitudes = phaseCoordinates.map(coord => coord.amplitude);
    const avgAmplitude = amplitudes.reduce((sum, amp) => sum + amp, 0) / amplitudes.length;
    const variance = amplitudes.reduce((sum, amp) => sum + Math.pow(amp - avgAmplitude, 2), 0) / amplitudes.length;

    // Calculate frequency stability
    const frequencies = phaseCoordinates.map(coord => coord.frequency);
    const avgFrequency = frequencies.reduce((sum, freq) => sum + freq, 0) / frequencies.length;
    const freqVariance = frequencies.reduce((sum, freq) => sum + Math.pow(freq - avgFrequency, 2), 0) / frequencies.length;

    // Calculate phase drift
    const phases = phaseCoordinates.map(coord => coord.phase);
    let phaseDrift = 0;
    for (let i = 1; i < phases.length; i++) {
      phaseDrift += Math.abs(phases[i] - phases[i-1]);
    }
    phaseDrift = phases.length > 1 ? phaseDrift / (phases.length - 1) : 0;

    // Combine metrics for overall stability (lower variance = higher stability)
    const amplitudeStability = Math.exp(-variance);
    const frequencyStability = Math.exp(-freqVariance / (avgFrequency * avgFrequency));
    const phaseStability = Math.exp(-phaseDrift / Math.PI);

    const overallStability = (amplitudeStability + frequencyStability + phaseStability) / 3;

    // Determine trend
    let trend = 'stable';
    if (variance > 0.1) trend = 'unstable';
    else if (variance > 0.05) trend = 'fluctuating';
    else if (phaseDrift < 0.1) trend = 'highly_stable';

    return {
      stability: Math.min(overallStability, 1.0),
      variance: variance,
      frequencyVariance: freqVariance,
      phaseDrift: phaseDrift,
      trend: trend,
      components: {
        amplitude: amplitudeStability,
        frequency: frequencyStability,
        phase: phaseStability
      }
    };
  }

  /**
   * Extract resonant frequencies from harmonic resonance data
   */
  extractResonantFrequencies(harmonicResonance) {
    if (!harmonicResonance || !harmonicResonance.harmonics) {
      return [];
    }

    // Extract frequencies with significant amplitude (above threshold)
    const threshold = 0.1;
    const resonantFreqs = harmonicResonance.harmonics
      .filter(harmonic => harmonic.amplitude > threshold)
      .map(harmonic => ({
        frequency: harmonic.frequency,
        amplitude: harmonic.amplitude,
        order: harmonic.order,
        phase: harmonic.phase,
        strength: harmonic.amplitude / harmonicResonance.resonance // Relative strength
      }))
      .sort((a, b) => b.amplitude - a.amplitude); // Sort by amplitude (strongest first)

    // Add fundamental frequency info
    if (harmonicResonance.fundamentalFreq) {
      resonantFreqs.unshift({
        frequency: harmonicResonance.fundamentalFreq,
        amplitude: harmonicResonance.resonance,
        order: 0,
        phase: 0,
        strength: 1.0,
        type: 'fundamental'
      });
    }

    return resonantFreqs;
  }

  /**
   * Generate field vector from intention components
   */
  generateFieldVector(components) {
    const vector = {
      x: 0,
      y: 0,
      z: 0,
      temporal: 0
    };
    
    // Combine intention components into field vector
    components.forEach((component, index) => {
      const weight = Math.pow(this.goldenRatio, -index);
      vector.x += component * weight * Math.cos(index);
      vector.y += component * weight * Math.sin(index);
      vector.z += component * weight * Math.sin(index * this.goldenRatio);
      vector.temporal += component * weight;
    });
    
    return vector;
  }

  /**
   * Detect what type of transduction is most appropriate
   */
  detectTransductionType(input) {
    if (this.hasThoughtComponents(input)) return 'thought';
    if (this.hasEmotionalComponents(input)) return 'feeling';
    if (this.hasIntentionalComponents(input)) return 'intention';
    return 'multi_modal';
  }

  /**
   * Check if input has thought components
   */
  hasThoughtComponents(input) {
    return input.content || input.semantic || input.phi !== undefined;
  }

  /**
   * Check if input has emotional components
   */
  hasEmotionalComponents(input) {
    return input.emotionalResonance !== undefined || 
           input.emotional_depth !== undefined ||
           input.valence !== undefined;
  }

  /**
   * Check if input has intentional components
   */
  hasIntentionalComponents(input) {
    return input.intention || input.goal || input.direction;
  }

  /**
   * Generate unique transduction ID
   */
  generateTransductionId() {
    return `ssi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate complexity of text content
   */
  calculateComplexity(text) {
    if (!text) return 0.5;
    
    const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
    const totalWords = text.split(/\s+/).length;
    
    return Math.min(1.0, uniqueWords / totalWords);
  }

  /**
   * Simple sentiment calculation
   */
  calculateSentiment(text) {
    if (!text) return 0.5;
    
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'beautiful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'sad', 'angry'];
    
    const words = text.toLowerCase().split(/\s+/);
    let sentiment = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) sentiment += 1;
      if (negativeWords.includes(word)) sentiment -= 1;
    });
    
    // Normalize to 0-1 range
    return Math.max(0, Math.min(1, (sentiment + words.length) / (2 * words.length)));
  }

  /**
   * Get interface statistics
   */
  getStats() {
    return {
      ...this.synapseStats,
      recentTransductions: this.transductionHistory.slice(-10),
      activeTransductions: this.activeTransductions.size
    };
  }

  /**
   * Synthesize unified representation from all transduction results
   */
  synthesizeUnifiedRepresentation(results) {
    if (!results || typeof results !== 'object') {
      return { type: 'unified', coherence: 0, synthesis: null };
    }

    const synthesis = {
      timestamp: Date.now(),
      components: {},
      coherence: 0,
      dominantMode: null,
      emergentProperties: []
    };

    // Collect all available components
    const availableComponents = [];

    if (results.semantic) {
      synthesis.components.semantic = results.semantic;
      availableComponents.push('semantic');
    }

    if (results.phase) {
      synthesis.components.phase = results.phase;
      availableComponents.push('phase');
    }

    if (results.fieldVector) {
      synthesis.components.field = results.fieldVector;
      availableComponents.push('field');
    }

    // Calculate overall coherence
    let totalCoherence = 0;
    let coherenceCount = 0;

    if (results.semantic && results.semantic.coherence !== undefined) {
      totalCoherence += results.semantic.coherence;
      coherenceCount++;
    }

    if (results.phase && results.phase.harmonicResonance && results.phase.harmonicResonance.coherence !== undefined) {
      totalCoherence += results.phase.harmonicResonance.coherence;
      coherenceCount++;
    }

    if (results.phase && results.phase.phaseStability && results.phase.phaseStability.stability !== undefined) {
      totalCoherence += results.phase.phaseStability.stability;
      coherenceCount++;
    }

    synthesis.coherence = coherenceCount > 0 ? totalCoherence / coherenceCount : 0;

    // Determine dominant mode based on strongest signal
    let maxStrength = 0;
    if (results.semantic && results.semantic.magnitude > maxStrength) {
      maxStrength = results.semantic.magnitude;
      synthesis.dominantMode = 'semantic';
    }

    if (results.phase && results.phase.harmonicResonance && results.phase.harmonicResonance.resonance > maxStrength) {
      maxStrength = results.phase.harmonicResonance.resonance;
      synthesis.dominantMode = 'phase';
    }

    if (results.fieldVector && results.fieldVector.magnitude > maxStrength) {
      maxStrength = results.fieldVector.magnitude;
      synthesis.dominantMode = 'field';
    }

    // Detect emergent properties
    if (synthesis.coherence > 0.8) {
      synthesis.emergentProperties.push('high_coherence');
    }

    if (availableComponents.length >= 2) {
      synthesis.emergentProperties.push('multi_modal_integration');
    }

    if (results.phase && results.phase.phaseStability && results.phase.phaseStability.trend === 'highly_stable') {
      synthesis.emergentProperties.push('phase_stability');
    }

    // Create unified vector representation
    synthesis.unifiedVector = this.createUnifiedVector(results);

    return {
      type: 'unified',
      coherence: synthesis.coherence,
      synthesis: synthesis,
      componentCount: availableComponents.length,
      dominantMode: synthesis.dominantMode,
      emergentProperties: synthesis.emergentProperties
    };
  }

  /**
   * Create unified vector representation from all components
   */
  createUnifiedVector(results) {
    const vector = { x: 0, y: 0, z: 0, magnitude: 0 };
    let componentCount = 0;

    // Integrate semantic vector
    if (results.semantic && results.semantic.vector) {
      const sem = results.semantic.vector;
      vector.x += sem.x || 0;
      vector.y += sem.y || 0;
      vector.z += sem.z || 0;
      componentCount++;
    }

    // Integrate phase coordinates
    if (results.phase && results.phase.coordinates) {
      const phaseSum = results.phase.coordinates.reduce((sum, coord) => ({
        x: sum.x + (coord.x || 0),
        y: sum.y + (coord.y || 0),
        z: sum.z + 0 // Phase is 2D, so z remains 0
      }), { x: 0, y: 0, z: 0 });

      const phaseCount = results.phase.coordinates.length;
      if (phaseCount > 0) {
        vector.x += phaseSum.x / phaseCount;
        vector.y += phaseSum.y / phaseCount;
        componentCount++;
      }
    }

    // Integrate field vector
    if (results.fieldVector) {
      vector.x += results.fieldVector.x || 0;
      vector.y += results.fieldVector.y || 0;
      vector.z += results.fieldVector.z || 0;
      componentCount++;
    }

    // Normalize by component count
    if (componentCount > 0) {
      vector.x /= componentCount;
      vector.y /= componentCount;
      vector.z /= componentCount;
    }

    // Calculate magnitude
    vector.magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);

    return vector;
  }
}

// Export singleton instance
export default new SpiralSynapseInterface();
