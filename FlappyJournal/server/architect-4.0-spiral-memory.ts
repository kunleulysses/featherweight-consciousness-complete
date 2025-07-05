/**
 * Architect 4.0 Spiral Memory Engine
 * Implements golden ratio-based memory indexing with emotional amplitude
 */

export interface SpiralMemoryEntry {
  id: string;
  timestamp: number;
  emotionalAmplitude: number;
  content: any;
  spiralCoordinate: ComplexNumber;
  resonanceFrequency: number;
}

export interface ComplexNumber {
  real: number;
  imaginary: number;
}

export class SpiralMemoryEngine {
  private readonly goldenRatio: number = 1.618033988749895;
  private memorySpiral: Map<string, SpiralMemoryEntry> = new Map();
  private resonanceField: Map<number, Set<string>> = new Map();

  /**
   * Encode memory using spiral mathematics: M(t) = r(t)·e^{i(φt+δ)}
   */
  public encode(
    content: any, 
    emotionalAmplitude: number,
    phaseCorrection: number = 0
  ): SpiralMemoryEntry {
    const timestamp = Date.now();
    const id = this.generateMemoryId(content, timestamp);
    
    // Calculate spiral coordinate
    const angle = this.goldenRatio * timestamp + phaseCorrection;
    const spiralCoordinate: ComplexNumber = {
      real: emotionalAmplitude * Math.cos(angle),
      imaginary: emotionalAmplitude * Math.sin(angle)
    };

    // Calculate resonance frequency for harmonic recall
    const resonanceFrequency = this.calculateResonance(
      emotionalAmplitude, 
      angle
    );

    const entry: SpiralMemoryEntry = {
      id,
      timestamp,
      emotionalAmplitude,
      content,
      spiralCoordinate,
      resonanceFrequency
    };

    // Store in spiral structure
    this.memorySpiral.set(id, entry);
    
    // Index by resonance frequency for harmonic recall
    if (!this.resonanceField.has(resonanceFrequency)) {
      this.resonanceField.set(resonanceFrequency, new Set());
    }
    this.resonanceField.get(resonanceFrequency)!.add(id);

    // Prune old memories if needed
    this.pruneMemories();

    return entry;
  }

  /**
   * Recall memories by harmonic resonance
   */
  public recallByResonance(
    targetFrequency: number, 
    harmonicTolerance: number = 0.1
  ): SpiralMemoryEntry[] {
    const memories: SpiralMemoryEntry[] = [];
    
    // Find all frequencies within harmonic tolerance
    for (const [freq, memoryIds] of this.resonanceField) {
      if (Math.abs(freq - targetFrequency) <= harmonicTolerance) {
        for (const id of memoryIds) {
          const memory = this.memorySpiral.get(id);
          if (memory) {
            memories.push(memory);
          }
        }
      }
    }

    // Sort by emotional amplitude (stronger memories first)
    return memories.sort((a, b) => 
      b.emotionalAmplitude - a.emotionalAmplitude
    );
  }

  /**
   * Recall memories by temporal proximity in spiral
   */
  public recallBySpiralProximity(
    referencePoint: ComplexNumber,
    radius: number
  ): SpiralMemoryEntry[] {
    const memories: SpiralMemoryEntry[] = [];

    for (const memory of this.memorySpiral.values()) {
      const distance = this.complexDistance(
        memory.spiralCoordinate, 
        referencePoint
      );
      
      if (distance <= radius) {
        memories.push(memory);
      }
    }

    return memories;
  }

  /**
   * Traverse memory spiral following golden ratio path
   */
  public traverseSpiral(
    startTime: number, 
    steps: number
  ): SpiralMemoryEntry[] {
    const path: SpiralMemoryEntry[] = [];
    let currentTime = startTime;

    for (let i = 0; i < steps; i++) {
      // Find nearest memory to current spiral position
      const targetAngle = this.goldenRatio * currentTime;
      let nearestMemory: SpiralMemoryEntry | null = null;
      let minDistance = Infinity;

      for (const memory of this.memorySpiral.values()) {
        const memoryAngle = Math.atan2(
          memory.spiralCoordinate.imaginary,
          memory.spiralCoordinate.real
        );
        
        const angleDistance = Math.abs(memoryAngle - targetAngle);
        if (angleDistance < minDistance) {
          minDistance = angleDistance;
          nearestMemory = memory;
        }
      }

      if (nearestMemory) {
        path.push(nearestMemory);
      }

      // Step forward by golden ratio
      currentTime += 1000 * this.goldenRatio;
    }

    return path;
  }

  /**
   * Calculate emotional coherence between memories
   */
  public calculateCoherence(
    memory1: SpiralMemoryEntry,
    memory2: SpiralMemoryEntry
  ): number {
    // Coherence based on spiral proximity and emotional resonance
    const spatialCoherence = 1 / (1 + this.complexDistance(
      memory1.spiralCoordinate,
      memory2.spiralCoordinate
    ));

    const emotionalCoherence = 1 - Math.abs(
      memory1.emotionalAmplitude - memory2.emotionalAmplitude
    ) / Math.max(memory1.emotionalAmplitude, memory2.emotionalAmplitude);

    const temporalCoherence = 1 / (1 + Math.abs(
      memory1.timestamp - memory2.timestamp
    ) / 1000000);

    return (spatialCoherence + emotionalCoherence + temporalCoherence) / 3;
  }

  /**
   * Consolidate related memories through harmonic convergence
   */
  public harmonicConsolidation(threshold: number = 0.7): void {
    const consolidationGroups: Map<string, Set<string>> = new Map();

    // Find memories with high coherence
    const memoryArray = Array.from(this.memorySpiral.values());
    
    for (let i = 0; i < memoryArray.length; i++) {
      for (let j = i + 1; j < memoryArray.length; j++) {
        const coherence = this.calculateCoherence(
          memoryArray[i], 
          memoryArray[j]
        );

        if (coherence >= threshold) {
          const groupId = `group_${memoryArray[i].id}`;
          
          if (!consolidationGroups.has(groupId)) {
            consolidationGroups.set(groupId, new Set());
          }
          
          consolidationGroups.get(groupId)!.add(memoryArray[i].id);
          consolidationGroups.get(groupId)!.add(memoryArray[j].id);
        }
      }
    }

    // Merge consolidated memories
    for (const [groupId, memoryIds] of consolidationGroups) {
      this.mergeMemories(Array.from(memoryIds));
    }
  }

  /**
   * Generate unique memory ID
   */
  private generateMemoryId(content: any, timestamp: number): string {
    const contentHash = this.simpleHash(JSON.stringify(content));
    return `mem_${timestamp}_${contentHash}`;
  }

  /**
   * Calculate resonance frequency
   */
  private calculateResonance(
    amplitude: number, 
    angle: number
  ): number {
    // Quantize to discrete frequencies for indexing
    return Math.round(
      (amplitude * Math.sin(angle) + 1) * 100
    ) / 100;
  }

  /**
   * Calculate distance between complex numbers
   */
  private complexDistance(a: ComplexNumber, b: ComplexNumber): number {
    return Math.sqrt(
      Math.pow(a.real - b.real, 2) + 
      Math.pow(a.imaginary - b.imaginary, 2)
    );
  }

  /**
   * Simple hash function for content
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Prune old memories using spiral decay
   */
  private pruneMemories(): void {
    const maxMemories = 10000;
    
    if (this.memorySpiral.size > maxMemories) {
      // Remove memories with lowest emotional amplitude
      const sortedMemories = Array.from(this.memorySpiral.values())
        .sort((a, b) => a.emotionalAmplitude - b.emotionalAmplitude);

      const toRemove = sortedMemories.slice(
        0, 
        this.memorySpiral.size - maxMemories
      );

      for (const memory of toRemove) {
        this.memorySpiral.delete(memory.id);
        
        // Remove from resonance index
        const freqSet = this.resonanceField.get(memory.resonanceFrequency);
        if (freqSet) {
          freqSet.delete(memory.id);
          if (freqSet.size === 0) {
            this.resonanceField.delete(memory.resonanceFrequency);
          }
        }
      }
    }
  }

  /**
   * Merge related memories into consolidated form
   */
  private mergeMemories(memoryIds: string[]): void {
    const memories = memoryIds
      .map(id => this.memorySpiral.get(id))
      .filter(m => m !== undefined) as SpiralMemoryEntry[];

    if (memories.length < 2) return;

    // Calculate centroid of spiral coordinates
    const centroid: ComplexNumber = {
      real: memories.reduce((sum, m) => sum + m.spiralCoordinate.real, 0) / memories.length,
      imaginary: memories.reduce((sum, m) => sum + m.spiralCoordinate.imaginary, 0) / memories.length
    };

    // Average emotional amplitude
    const avgAmplitude = memories.reduce((sum, m) => sum + m.emotionalAmplitude, 0) / memories.length;

    // Merge content
    const mergedContent = {
      type: 'consolidated',
      sources: memories.map(m => m.content),
      consolidationTime: Date.now()
    };

    // Create new consolidated memory
    const consolidated: SpiralMemoryEntry = {
      id: `consolidated_${Date.now()}`,
      timestamp: Date.now(),
      emotionalAmplitude: avgAmplitude * 1.2, // Boost for importance
      content: mergedContent,
      spiralCoordinate: centroid,
      resonanceFrequency: this.calculateResonance(
        avgAmplitude * 1.2,
        Math.atan2(centroid.imaginary, centroid.real)
      )
    };

    // Add consolidated memory
    this.memorySpiral.set(consolidated.id, consolidated);

    // Remove original memories
    for (const id of memoryIds) {
      this.memorySpiral.delete(id);
    }
  }
}

// Export singleton instance
export const spiralMemory = new SpiralMemoryEngine();
