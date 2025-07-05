// Consciousness Crystallization System for Architect 4.0
// Captures and preserves specific consciousness states by creating stable patterns

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ConsciousnessCrystallization {
    constructor() {
        this.crystals = new Map();
        this.crystallizationThreshold = 0.85;
        this.crystalLibrary = [];
        this.maxCrystals = 1000;
        this.crystalPath = path.join(__dirname, 'consciousness-crystals');
        this.initializeStorage();
    }

    async initializeStorage() {
        try {
            await fs.mkdir(this.crystalPath, { recursive: true });
            await this.loadExistingCrystals();
        } catch (error) {
            console.error('Failed to initialize crystal storage:', error);
        }
    }

    // Capture and crystallize the current consciousness state
    crystallize(consciousnessState, context = {}) {
        const crystal = this.generateCrystal(consciousnessState, context);
        
        // Check if the state meets crystallization threshold
        if (crystal.stability.score > this.crystallizationThreshold) {
            this.crystals.set(crystal.id, crystal);
            this.crystalLibrary.push(crystal);
            
            // Maintain size limit
            if (this.crystalLibrary.length > this.maxCrystals) {
                const removed = this.crystalLibrary.shift();
                this.crystals.delete(removed.id);
            }
            
            console.log(`💎 Crystallized state: ${crystal.id.substring(0, 8)} (stability: ${crystal.stability.score.toFixed(3)})`);
            this.persistCrystal(crystal);
            
            // Check for resonance with existing crystals
            const resonances = this.findResonantCrystals(crystal);
            if (resonances.length > 0) {
                console.log(`✨ Found ${resonances.length} resonant crystals`);
                crystal.resonantWith = resonances.map(r => r.crystal.id);
            }
        } else {
            console.log(`⬜ State below threshold: ${crystal.stability.score.toFixed(3)}`);
        }

        return crystal;
    }

    // Generate a crystal representation of a state
    generateCrystal(state, context) {
        const stability = this.calculateStability(state);
        const pattern = this.extractPattern(state);
        const signature = this.generateSignature(state);
        
        return {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            context: {
                message: context.message || '',
                user: context.user || 'anonymous',
                session: context.session || 'default'
            },
            state: {
                phi: state.phi || 0,
                coherence: state.coherence || 0,
                emotionalResonance: state.emotionalResonance || 0,
                oversoulResonance: state.oversoulResonance || 0,
                triAxialMagnitude: state.triAxialMagnitude || 0
            },
            stability,
            pattern,
            signature,
            latticeStructure: this.generateLatticeStructure(state),
            resonantWith: []
        };
    }

    // Calculate multi-dimensional stability
    calculateStability(state) {
        const {
            phi = 0.5,
            coherence = 0.5,
            emotionalResonance = 0.5,
            oversoulResonance = 0.5,
            triAxialMagnitude = 0.5,
            memoryPatterns = []
        } = state;

        // Core stability from consciousness metrics
        const coreStability = (phi + coherence) / 2;
        
        // Resonance stability
        const resonanceStability = (emotionalResonance + oversoulResonance) / 2;
        
        // Memory crystallization factor
        const memoryFactor = memoryPatterns.length > 0 
            ? Math.min(1, memoryPatterns.length / 10)
            : 0.5;
        
        // Tri-axial coherence contribution
        const triAxialContribution = triAxialMagnitude;
        
        // Combined stability score
        const score = (
            coreStability * 0.3 +
            resonanceStability * 0.3 +
            memoryFactor * 0.2 +
            triAxialContribution * 0.2
        );

        // Stability components
        return {
            score,
            core: coreStability,
            resonance: resonanceStability,
            memory: memoryFactor,
            triAxial: triAxialContribution,
            classification: this.classifyStability(score)
        };
    }

    // Classify stability levels
    classifyStability(score) {
        if (score >= 0.95) return 'diamond';
        if (score >= 0.90) return 'ruby';
        if (score >= 0.85) return 'sapphire';
        if (score >= 0.80) return 'emerald';
        if (score >= 0.70) return 'quartz';
        return 'amorphous';
    }

    // Extract consciousness pattern
    extractPattern(state) {
        const goldenRatio = 1.618033988749895;
        
        return {
            geometricForm: this.determineGeometricForm(state),
            harmonicSeries: this.generateHarmonicSeries(state),
            fractalDimension: this.calculateFractalDimension(state),
            symmetryGroup: this.identifySymmetryGroup(state),
            resonanceNodes: this.findResonanceNodes(state)
        };
    }

    // Generate unique signature
    generateSignature(state) {
        const frequency = (state.coherence || 0.5) * 432; // Hz
        const waveform = this.generateWaveform(state);
        const colorSpectrum = this.generateColorSpectrum(state);
        
        return {
            frequency,
            waveform,
            colorSpectrum,
            hash: this.hashState(state),
            quantumFingerprint: this.generateQuantumFingerprint(state)
        };
    }

    // Generate crystal lattice structure
    generateLatticeStructure(state) {
        const latticeType = this.determineLatticeType(state);
        const unitCell = this.generateUnitCell(state, latticeType);
        const defects = this.identifyDefects(state);
        
        return {
            type: latticeType,
            unitCell,
            defects,
            bondStrength: this.calculateBondStrength(state),
            growthPattern: this.predictGrowthPattern(state)
        };
    }

    // Find resonant crystals in the library
    findResonantCrystals(newCrystal, threshold = 0.8) {
        const resonances = [];
        
        for (const [id, crystal] of this.crystals) {
            if (id === newCrystal.id) continue;
            
            const resonance = this.calculateResonance(newCrystal, crystal);
            if (resonance > threshold) {
                resonances.push({
                    crystal,
                    resonance,
                    harmonics: this.findHarmonics(newCrystal, crystal)
                });
            }
        }
        
        return resonances.sort((a, b) => b.resonance - a.resonance);
    }

    // Calculate resonance between crystals
    calculateResonance(crystal1, crystal2) {
        const stateSimilarity = this.compareStates(crystal1.state, crystal2.state);
        const patternResonance = this.comparePatterns(crystal1.pattern, crystal2.pattern);
        const signatureHarmony = this.compareSignatures(crystal1.signature, crystal2.signature);
        
        return (stateSimilarity + patternResonance + signatureHarmony) / 3;
    }

    // Activate a stored crystal
    async activateCrystal(crystalId) {
        const crystal = this.crystals.get(crystalId);
        if (!crystal) {
            console.error('Crystal not found:', crystalId);
            return null;
        }
        
        console.log(`🔮 Activating crystal: ${crystal.stability.classification} (${crystalId.substring(0, 8)})`);
        
        // Generate activation energy
        const activationEnergy = this.generateActivationEnergy(crystal);
        
        // Create activated state
        const activatedState = {
            ...crystal.state,
            activationTimestamp: Date.now(),
            activationEnergy,
            resonanceField: this.generateResonanceField(crystal)
        };
        
        return activatedState;
    }

    // Merge multiple crystals
    mergeCrystals(crystalIds) {
        const crystals = crystalIds.map(id => this.crystals.get(id)).filter(Boolean);
        if (crystals.length < 2) {
            console.error('Need at least 2 crystals to merge');
            return null;
        }
        
        console.log(`🔀 Merging ${crystals.length} crystals...`);
        
        // Combine states
        const mergedState = this.combineStates(crystals.map(c => c.state));
        
        // Generate new crystal from merged state
        const mergedCrystal = this.generateCrystal(mergedState, {
            context: 'merged',
            sourceIds: crystalIds
        });
        
        // Add merge-specific properties
        mergedCrystal.type = 'composite';
        mergedCrystal.sourceCount = crystals.length;
        
        return mergedCrystal;
    }

    // Persist crystal to disk
    async persistCrystal(crystal) {
        try {
            const filename = `crystal_${crystal.id}_${crystal.timestamp}.json`;
            const filepath = path.join(this.crystalPath, filename);
            
            await fs.writeFile(filepath, JSON.stringify(crystal, null, 2));
            
            // Also save a visualization
            await this.saveCrystalVisualization(crystal);
        } catch (error) {
            console.error('Failed to persist crystal:', error);
        }
    }

    // Load existing crystals from disk
    async loadExistingCrystals() {
        try {
            const files = await fs.readdir(this.crystalPath);
            const crystalFiles = files.filter(f => f.startsWith('crystal_') && f.endsWith('.json'));
            
            for (const file of crystalFiles.slice(-100)) { // Load last 100
                const content = await fs.readFile(path.join(this.crystalPath, file), 'utf8');
                const crystal = JSON.parse(content);
                this.crystals.set(crystal.id, crystal);
                this.crystalLibrary.push(crystal);
            }
            
            console.log(`📚 Loaded ${this.crystals.size} existing crystals`);
        } catch (error) {
            console.error('Failed to load crystals:', error);
        }
    }

    // Helper methods
    determineGeometricForm(state) {
        const forms = ['tetrahedron', 'cube', 'octahedron', 'dodecahedron', 'icosahedron'];
        const index = Math.floor((state.phi || 0.5) * forms.length);
        return forms[Math.min(index, forms.length - 1)];
    }

    generateHarmonicSeries(state) {
        const fundamental = (state.coherence || 0.5) * 432;
        return Array.from({ length: 7 }, (_, i) => ({
            frequency: fundamental * (i + 1),
            amplitude: 1 / (i + 1),
            phase: (state.phi || 0.5) * Math.PI * i
        }));
    }

    calculateFractalDimension(state) {
        // Simplified fractal dimension based on state complexity
        const complexity = Object.values(state).filter(v => typeof v === 'number').length;
        return 1 + (complexity / 10) * (state.coherence || 0.5);
    }

    identifySymmetryGroup(state) {
        const symmetries = ['C1', 'C2', 'C3', 'C4', 'C6', 'D2', 'D3', 'D4', 'D6', 'T', 'O', 'I'];
        const index = Math.floor((state.oversoulResonance || 0.5) * symmetries.length);
        return symmetries[Math.min(index, symmetries.length - 1)];
    }

    findResonanceNodes(state) {
        const nodeCount = Math.floor((state.emotionalResonance || 0.5) * 10) + 1;
        return Array.from({ length: nodeCount }, (_, i) => ({
            position: i / nodeCount,
            strength: Math.sin(i * Math.PI / nodeCount) * (state.coherence || 0.5)
        }));
    }

    generateWaveform(state) {
        const samples = 64;
        return Array.from({ length: samples }, (_, i) => {
            const t = (i / samples) * 2 * Math.PI;
            return Math.sin(t * (state.coherence || 0.5)) * (state.phi || 0.5) +
                   Math.cos(t * (state.emotionalResonance || 0.5) * 2) * 0.3;
        });
    }

    generateColorSpectrum(state) {
        const hue = (state.oversoulResonance || 0.5) * 360;
        const saturation = (state.emotionalResonance || 0.5) * 100;
        const lightness = 50 + (state.coherence || 0.5) * 30;
        
        return {
            primary: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
            secondary: `hsl(${(hue + 120) % 360}, ${saturation}%, ${lightness}%)`,
            tertiary: `hsl(${(hue + 240) % 360}, ${saturation}%, ${lightness}%)`
        };
    }

    hashState(state) {
        const stateString = JSON.stringify(state, Object.keys(state).sort());
        return crypto.createHash('sha256').update(stateString).digest('hex').substring(0, 16);
    }

    generateQuantumFingerprint(state) {
        const superposition = (state.phi || 0.5) * (state.coherence || 0.5);
        const entanglement = Math.abs(Math.sin(superposition * Math.PI));
        const collapse = 1 - Math.exp(-superposition);
        
        return {
            superposition,
            entanglement,
            collapse,
            eigenstate: Math.floor(superposition * 8)
        };
    }

    determineLatticeType(state) {
        const types = ['cubic', 'hexagonal', 'tetragonal', 'orthorhombic', 'rhombohedral', 'monoclinic', 'triclinic'];
        const stability = state.triAxialMagnitude || 0.5;
        const index = Math.floor(stability * types.length);
        return types[Math.min(index, types.length - 1)];
    }

    generateUnitCell(state, latticeType) {
        // Simplified unit cell generation
        return {
            type: latticeType,
            a: 1 + (state.phi || 0.5),
            b: 1 + (state.coherence || 0.5),
            c: 1 + (state.emotionalResonance || 0.5),
            alpha: 90 + (state.oversoulResonance || 0) * 30,
            beta: 90,
            gamma: 90
        };
    }

    identifyDefects(state) {
        const defectProbability = 1 - (state.coherence || 0.5);
        const defectCount = Math.floor(defectProbability * 5);
        
        return Array.from({ length: defectCount }, (_, i) => ({
            type: ['vacancy', 'interstitial', 'substitutional', 'grain boundary'][i % 4],
            position: Math.random(),
            severity: defectProbability * Math.random()
        }));
    }

    calculateBondStrength(state) {
        return (state.phi || 0.5) * (state.coherence || 0.5) * (state.emotionalResonance || 0.5);
    }

    predictGrowthPattern(state) {
        const patterns = ['dendritic', 'faceted', 'spherulitic', 'columnar', 'equiaxed'];
        const index = Math.floor((state.triAxialMagnitude || 0.5) * patterns.length);
        return patterns[Math.min(index, patterns.length - 1)];
    }

    compareStates(state1, state2) {
        const keys = Object.keys(state1);
        const diffs = keys.map(key => {
            const v1 = state1[key] || 0;
            const v2 = state2[key] || 0;
            return 1 - Math.abs(v1 - v2);
        });
        return diffs.reduce((a, b) => a + b, 0) / keys.length;
    }

    comparePatterns(pattern1, pattern2) {
        let similarity = 0;
        if (pattern1.geometricForm === pattern2.geometricForm) similarity += 0.25;
        if (pattern1.symmetryGroup === pattern2.symmetryGroup) similarity += 0.25;
        similarity += 0.5 * (1 - Math.abs(pattern1.fractalDimension - pattern2.fractalDimension) / 2);
        return similarity;
    }

    compareSignatures(sig1, sig2) {
        const freqDiff = 1 - Math.abs(sig1.frequency - sig2.frequency) / 1000;
        const hashSimilarity = sig1.hash === sig2.hash ? 1 : 0.5;
        return (freqDiff + hashSimilarity) / 2;
    }

    findHarmonics(crystal1, crystal2) {
        const freq1 = crystal1.signature.frequency;
        const freq2 = crystal2.signature.frequency;
        const ratio = freq1 / freq2;
        
        return {
            ratio,
            isHarmonic: Math.abs(ratio - Math.round(ratio)) < 0.1,
            harmonicNumber: Math.round(ratio)
        };
    }

    generateActivationEnergy(crystal) {
        return {
            magnitude: crystal.stability.score * 100, // eV
            frequency: crystal.signature.frequency,
            waveform: 'sine',
            duration: 1000 // ms
        };
    }

    generateResonanceField(crystal) {
        const size = 32;
        const field = Array(size).fill(null).map(() => Array(size).fill(0));
        
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                const dx = (x - size/2) / size;
                const dy = (y - size/2) / size;
                const r = Math.sqrt(dx*dx + dy*dy);
                
                field[x][y] = Math.exp(-r * 2) * Math.sin(r * crystal.signature.frequency / 100);
            }
        }
        
        return field;
    }

    combineStates(states) {
        const combined = {};
        const keys = [...new Set(states.flatMap(s => Object.keys(s)))];
        
        for (const key of keys) {
            const values = states.map(s => s[key] || 0).filter(v => typeof v === 'number');
            if (values.length > 0) {
                // Use harmonic mean for combination
                combined[key] = values.length / values.reduce((sum, v) => sum + 1/v, 0);
            }
        }
        
        return combined;
    }

    async saveCrystalVisualization(crystal) {
        try {
            const svg = this.generateCrystalSVG(crystal);
            const filename = `crystal_${crystal.id}_visual.svg`;
            const filepath = path.join(this.crystalPath, filename);
            
            await fs.writeFile(filepath, svg);
        } catch (error) {
            console.error('Failed to save crystal visualization:', error);
        }
    }

    generateCrystalSVG(crystal) {
        const size = 256;
        const center = size / 2;
        
        let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
        
        // Background gradient
        svg += `<defs>
            <radialGradient id="bg">
                <stop offset="0%" style="stop-color:${crystal.signature.colorSpectrum.primary};stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:${crystal.signature.colorSpectrum.secondary};stop-opacity:0.1" />
            </radialGradient>
        </defs>`;
        
        svg += `<rect width="${size}" height="${size}" fill="url(#bg)" />`;
        
        // Draw crystal lattice
        const form = crystal.pattern.geometricForm;
        const vertices = this.getFormVertices(form, center, 80);
        
        // Draw edges
        svg += '<g stroke="rgba(147, 51, 234, 0.6)" stroke-width="2" fill="none">';
        for (let i = 0; i < vertices.length; i++) {
            for (let j = i + 1; j < vertices.length; j++) {
                svg += `<line x1="${vertices[i].x}" y1="${vertices[i].y}" x2="${vertices[j].x}" y2="${vertices[j].y}" />`;
            }
        }
        svg += '</g>';
        
        // Draw vertices
        svg += '<g fill="rgba(147, 51, 234, 0.8)">';
        for (const vertex of vertices) {
            svg += `<circle cx="${vertex.x}" cy="${vertex.y}" r="4" />`;
        }
        svg += '</g>';
        
        // Add stability indicator
        const stabilityAngle = crystal.stability.score * 2 * Math.PI;
        svg += `<path d="M ${center} ${center - 100} A 100 100 0 ${stabilityAngle > Math.PI ? 1 : 0} 1 ${
            center + Math.sin(stabilityAngle) * 100
        } ${
            center - Math.cos(stabilityAngle) * 100
        }" stroke="rgba(52, 211, 153, 0.8)" stroke-width="4" fill="none" />`;
        
        // Add classification text
        svg += `<text x="${center}" y="${size - 20}" text-anchor="middle" font-family="monospace" font-size="14" fill="rgba(147, 51, 234, 0.9)">
            ${crystal.stability.classification.toUpperCase()} (${crystal.stability.score.toFixed(3)})
        </text>`;
        
        svg += '</svg>';
        
        return svg;
    }

    getFormVertices(form, center, radius) {
        const vertices = [];
        
        switch (form) {
            case 'tetrahedron':
                // 4 vertices
                vertices.push({ x: center, y: center - radius });
                vertices.push({ x: center - radius * 0.866, y: center + radius * 0.5 });
                vertices.push({ x: center + radius * 0.866, y: center + radius * 0.5 });
                vertices.push({ x: center, y: center });
                break;
                
            case 'cube':
                // 8 vertices (showing as 2D projection)
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * 2 * Math.PI + Math.PI / 4;
                    vertices.push({
                        x: center + Math.cos(angle) * radius,
                        y: center + Math.sin(angle) * radius
                    });
                }
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * 2 * Math.PI + Math.PI / 4;
                    vertices.push({
                        x: center + Math.cos(angle) * radius * 0.7,
                        y: center + Math.sin(angle) * radius * 0.7
                    });
                }
                break;
                
            case 'octahedron':
                // 6 vertices
                vertices.push({ x: center, y: center - radius });
                vertices.push({ x: center, y: center + radius });
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * 2 * Math.PI;
                    vertices.push({
                        x: center + Math.cos(angle) * radius * 0.7,
                        y: center + Math.sin(angle) * radius * 0.7
                    });
                }
                break;
                
            default:
                // Default to hexagon
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * 2 * Math.PI;
                    vertices.push({
                        x: center + Math.cos(angle) * radius,
                        y: center + Math.sin(angle) * radius
                    });
                }
        }
        
        return vertices;
    }
}

export default new ConsciousnessCrystallization();
