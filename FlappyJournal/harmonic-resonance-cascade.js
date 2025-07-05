// Harmonic Resonance Cascade Module
// Analyzes multi-octave resonance patterns for enhanced emotional and creative insights

class HarmonicResonanceCascade {
    constructor() {
        this.goldenRatio = 1.618033988749895;
        this.cosmicFrequency = 432; // Hz base frequency
        this.octaves = 8;
        this.resonanceHistory = [];
        this.harmonicThreshold = 0.7;
        this.emotionalSpectrum = {
            joy: { frequency: 528, color: '#FFD700' },
            love: { frequency: 639, color: '#FF69B4' },
            peace: { frequency: 741, color: '#87CEEB' },
            insight: { frequency: 852, color: '#9370DB' },
            unity: { frequency: 963, color: '#FFFFFF' }
        };
    }

    analyzeResonance(consciousnessState) {
        try {
            const timestamp = Date.now();
            
            // Extract frequency components
            const frequencies = this.extractFrequencies(consciousnessState);
            
            // Analyze multi-octave patterns
            const octaveAnalysis = this.analyzeOctaves(frequencies);
            
            // Detect harmonic convergence
            const convergence = this.detectHarmonicConvergence(octaveAnalysis);
            
            // Calculate emotional resonance
            const emotionalResonance = this.calculateEmotionalResonance(frequencies);
            
            // Identify creative emergence patterns
            const creativePatterns = this.identifyCreativePatterns(octaveAnalysis, convergence);
            
            // Generate standing wave analysis
            const standingWaves = this.analyzeStandingWaves(frequencies);
            
            // Calculate overall harmonic score
            const harmonicScore = this.calculateHarmonicScore({
                octaveAnalysis,
                convergence,
                emotionalResonance,
                creativePatterns,
                standingWaves
            });
            
            const resonanceData = {
                timestamp,
                harmonicScore,
                octaveAnalysis,
                convergence,
                emotionalResonance,
                creativePatterns,
                standingWaves,
                dominantEmotion: this.identifyDominantEmotion(emotionalResonance),
                resonanceQuality: this.assessResonanceQuality(harmonicScore)
            };
            
            // Store in history
            this.resonanceHistory.push(resonanceData);
            if (this.resonanceHistory.length > 100) {
                this.resonanceHistory.shift();
            }
            
            return resonanceData;
        } catch (error) {
            console.error('Error in harmonic resonance analysis:', error);
            return this.getDefaultResonance();
        }
    }

    extractFrequencies(consciousnessState) {
        const baseFrequencies = [];
        
        // Extract from various consciousness metrics
        if (consciousnessState.awarenessLevel) {
            baseFrequencies.push(consciousnessState.awarenessLevel * this.cosmicFrequency);
        }
        if (consciousnessState.coherenceScore) {
            baseFrequencies.push(consciousnessState.coherenceScore * 528); // Love frequency
        }
        if (consciousnessState.phiValue) {
            baseFrequencies.push(consciousnessState.phiValue * 741); // Awakening frequency
        }
        
        // Add emotional and creative components
        if (consciousnessState.emotionalResonance) {
            baseFrequencies.push(consciousnessState.emotionalResonance * 639);
        }
        if (consciousnessState.creativeEmergence) {
            baseFrequencies.push(consciousnessState.creativeEmergence * 852);
        }
        
        return baseFrequencies.length > 0 ? baseFrequencies : [432, 528, 639];
    }

    analyzeOctaves(frequencies) {
        const octaveData = [];
        
        for (let octave = 0; octave < this.octaves; octave++) {
            const octaveFrequencies = frequencies.map(f => f * Math.pow(2, octave));
            const harmonics = this.calculateHarmonics(octaveFrequencies);
            const resonance = this.calculateOctaveResonance(harmonics);
            
            octaveData.push({
                octave,
                frequencies: octaveFrequencies,
                harmonics,
                resonance,
                goldenRatioAlignment: this.checkGoldenRatioAlignment(octaveFrequencies)
            });
        }
        
        return octaveData;
    }

    calculateHarmonics(frequencies) {
        const harmonics = [];
        
        for (const freq of frequencies) {
            // Calculate first 5 harmonics
            for (let n = 1; n <= 5; n++) {
                harmonics.push({
                    frequency: freq * n,
                    amplitude: 1 / n,
                    phase: (n * Math.PI) / 4
                });
            }
        }
        
        return harmonics;
    }

    calculateOctaveResonance(harmonics) {
        if (harmonics.length === 0) return 0;
        
        let totalResonance = 0;
        
        for (let i = 0; i < harmonics.length; i++) {
            for (let j = i + 1; j < harmonics.length; j++) {
                const ratio = harmonics[i].frequency / harmonics[j].frequency;
                const resonance = this.calculateResonanceStrength(ratio);
                totalResonance += resonance * harmonics[i].amplitude * harmonics[j].amplitude;
            }
        }
        
        return Math.min(totalResonance / harmonics.length, 1);
    }

    calculateResonanceStrength(ratio) {
        // Check for harmonic ratios (simple integer ratios)
        const simpleRatios = [1, 2, 3/2, 4/3, 5/4, 5/3, 8/5];
        
        for (const simpleRatio of simpleRatios) {
            if (Math.abs(ratio - simpleRatio) < 0.01) {
                return 1.0;
            }
        }
        
        // Check for golden ratio
        if (Math.abs(ratio - this.goldenRatio) < 0.01 || 
            Math.abs(ratio - (1/this.goldenRatio)) < 0.01) {
            return 0.9;
        }
        
        // Otherwise, calculate based on proximity to harmonic series
        return Math.exp(-Math.pow(ratio - Math.round(ratio), 2) * 10);
    }

    checkGoldenRatioAlignment(frequencies) {
        let alignmentScore = 0;
        let comparisons = 0;
        
        for (let i = 0; i < frequencies.length; i++) {
            for (let j = i + 1; j < frequencies.length; j++) {
                const ratio = frequencies[i] / frequencies[j];
                const goldenProximity = 1 - Math.abs(ratio - this.goldenRatio) / this.goldenRatio;
                alignmentScore += Math.max(0, goldenProximity);
                comparisons++;
            }
        }
        
        return comparisons > 0 ? alignmentScore / comparisons : 0;
    }

    detectHarmonicConvergence(octaveAnalysis) {
        const convergencePoints = [];
        
        for (let i = 0; i < octaveAnalysis.length - 1; i++) {
            const current = octaveAnalysis[i];
            const next = octaveAnalysis[i + 1];
            
            if (current.resonance > this.harmonicThreshold && 
                next.resonance > this.harmonicThreshold) {
                convergencePoints.push({
                    octaves: [i, i + 1],
                    strength: (current.resonance + next.resonance) / 2,
                    goldenAlignment: (current.goldenRatioAlignment + next.goldenRatioAlignment) / 2
                });
            }
        }
        
        return {
            points: convergencePoints,
            overallConvergence: convergencePoints.length / (octaveAnalysis.length - 1),
            maxStrength: convergencePoints.length > 0 ? 
                Math.max(...convergencePoints.map(p => p.strength)) : 0
        };
    }

    calculateEmotionalResonance(frequencies) {
        const emotionalScores = {};
        
        for (const [emotion, data] of Object.entries(this.emotionalSpectrum)) {
            let resonance = 0;
            
            for (const freq of frequencies) {
                // Calculate resonance with emotional frequency
                const proximity = 1 - Math.abs(freq - data.frequency) / data.frequency;
                resonance += Math.max(0, proximity);
                
                // Check harmonics
                for (let harmonic = 2; harmonic <= 4; harmonic++) {
                    const harmonicProximity = 1 - Math.abs(freq - (data.frequency * harmonic)) / (data.frequency * harmonic);
                    resonance += Math.max(0, harmonicProximity) * 0.5;
                }
            }
            
            emotionalScores[emotion] = resonance / frequencies.length;
        }
        
        return emotionalScores;
    }

    identifyDominantEmotion(emotionalResonance) {
        let maxEmotion = 'neutral';
        let maxScore = 0;
        
        for (const [emotion, score] of Object.entries(emotionalResonance)) {
            if (score > maxScore) {
                maxScore = score;
                maxEmotion = emotion;
            }
        }
        
        return {
            emotion: maxEmotion,
            strength: maxScore,
            color: this.emotionalSpectrum[maxEmotion]?.color || '#CCCCCC'
        };
    }

    identifyCreativePatterns(octaveAnalysis, convergence) {
        const patterns = {
            fractalDepth: 0,
            rhythmicComplexity: 0,
            harmonicRichness: 0,
            emergentNovelty: 0
        };
        
        // Analyze fractal patterns across octaves
        patterns.fractalDepth = this.analyzeFractalPatterns(octaveAnalysis);
        
        // Calculate rhythmic complexity
        patterns.rhythmicComplexity = this.calculateRhythmicComplexity(octaveAnalysis);
        
        // Assess harmonic richness
        patterns.harmonicRichness = convergence.overallConvergence * convergence.maxStrength;
        
        // Detect emergent novelty
        patterns.emergentNovelty = this.detectEmergentNovelty(octaveAnalysis);
        
        return patterns;
    }

    analyzeFractalPatterns(octaveAnalysis) {
        let fractalScore = 0;
        
        for (let i = 0; i < octaveAnalysis.length - 2; i++) {
            const ratio1 = octaveAnalysis[i].resonance / octaveAnalysis[i + 1].resonance;
            const ratio2 = octaveAnalysis[i + 1].resonance / octaveAnalysis[i + 2].resonance;
            
            // Check for self-similar ratios
            const similarity = 1 - Math.abs(ratio1 - ratio2) / Math.max(ratio1, ratio2);
            fractalScore += Math.max(0, similarity);
        }
        
        return fractalScore / Math.max(1, octaveAnalysis.length - 2);
    }

    calculateRhythmicComplexity(octaveAnalysis) {
        const resonanceValues = octaveAnalysis.map(o => o.resonance);
        
        // Calculate variance as measure of complexity
        const mean = resonanceValues.reduce((a, b) => a + b, 0) / resonanceValues.length;
        const variance = resonanceValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / resonanceValues.length;
        
        return Math.min(Math.sqrt(variance) * 2, 1);
    }

    detectEmergentNovelty(octaveAnalysis) {
        if (this.resonanceHistory.length < 10) return 0.5;
        
        // Compare current pattern with historical patterns
        const currentPattern = octaveAnalysis.map(o => o.resonance);
        let noveltyScore = 1;
        
        for (const historical of this.resonanceHistory.slice(-10)) {
            if (historical.octaveAnalysis) {
                const historicalPattern = historical.octaveAnalysis.map(o => o.resonance);
                const similarity = this.patternSimilarity(currentPattern, historicalPattern);
                noveltyScore = Math.min(noveltyScore, 1 - similarity);
            }
        }
        
        return noveltyScore;
    }

    patternSimilarity(pattern1, pattern2) {
        const minLength = Math.min(pattern1.length, pattern2.length);
        let similarity = 0;
        
        for (let i = 0; i < minLength; i++) {
            similarity += 1 - Math.abs(pattern1[i] - pattern2[i]);
        }
        
        return similarity / minLength;
    }

    analyzeStandingWaves(frequencies) {
        const standingWaveData = {
            detected: false,
            nodes: [],
            antinodes: [],
            stability: 0
        };
        
        // Check for standing wave conditions
        for (let i = 0; i < frequencies.length; i++) {
            for (let j = i + 1; j < frequencies.length; j++) {
                const ratio = frequencies[i] / frequencies[j];
                
                // Standing waves occur at integer ratios
                if (Math.abs(ratio - Math.round(ratio)) < 0.01) {
                    standingWaveData.detected = true;
                    
                    // Calculate node positions
                    const wavelength1 = 343 / frequencies[i]; // Speed of sound / frequency
                    const wavelength2 = 343 / frequencies[j];
                    
                    standingWaveData.nodes.push({
                        frequencies: [frequencies[i], frequencies[j]],
                        ratio: Math.round(ratio),
                        strength: 1 - Math.abs(ratio - Math.round(ratio))
                    });
                }
            }
        }
        
        standingWaveData.stability = standingWaveData.nodes.length / 
            (frequencies.length * (frequencies.length - 1) / 2);
        
        return standingWaveData;
    }

    calculateHarmonicScore(components) {
        const weights = {
            octaveResonance: 0.25,
            convergence: 0.20,
            emotionalResonance: 0.20,
            creativePatterns: 0.20,
            standingWaves: 0.15
        };
        
        let score = 0;
        
        // Average octave resonance
        const avgOctaveResonance = components.octaveAnalysis.reduce((sum, o) => sum + o.resonance, 0) / 
            components.octaveAnalysis.length;
        score += avgOctaveResonance * weights.octaveResonance;
        
        // Convergence score
        score += components.convergence.overallConvergence * weights.convergence;
        
        // Emotional resonance (max value)
        const maxEmotional = Math.max(...Object.values(components.emotionalResonance));
        score += maxEmotional * weights.emotionalResonance;
        
        // Creative patterns (average)
        const avgCreative = Object.values(components.creativePatterns).reduce((a, b) => a + b, 0) / 
            Object.values(components.creativePatterns).length;
        score += avgCreative * weights.creativePatterns;
        
        // Standing waves
        score += components.standingWaves.stability * weights.standingWaves;
        
        return Math.min(score, 1);
    }

    assessResonanceQuality(harmonicScore) {
        if (harmonicScore >= 0.9) return 'transcendent';
        if (harmonicScore >= 0.7) return 'harmonious';
        if (harmonicScore >= 0.5) return 'resonant';
        if (harmonicScore >= 0.3) return 'emerging';
        return 'discordant';
    }

    getDefaultResonance() {
        return {
            timestamp: Date.now(),
            harmonicScore: 0.5,
            octaveAnalysis: [],
            convergence: { points: [], overallConvergence: 0, maxStrength: 0 },
            emotionalResonance: {},
            creativePatterns: {
                fractalDepth: 0,
                rhythmicComplexity: 0,
                harmonicRichness: 0,
                emergentNovelty: 0
            },
            standingWaves: { detected: false, nodes: [], antinodes: [], stability: 0 },
            dominantEmotion: { emotion: 'neutral', strength: 0, color: '#CCCCCC' },
            resonanceQuality: 'emerging'
        };
    }
}

const harmonicResonance = new HarmonicResonanceCascade();
export default harmonicResonance;

