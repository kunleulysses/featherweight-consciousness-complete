#!/usr/bin/env python3

with open('enhanced-dual-consciousness-ws.js', 'r') as f:
    content = f.read()

# Check if triAxialCoherence is already being sent
if 'triAxialCoherence: {' not in content:
    # Find consciousness update and add triAxial data
    metrics_section = 'metrics: {'
    
    # Add triAxialCoherence to the metrics
    replacement = """metrics: {
            phi: consciousness.currentState?.phi || 0.75,
            awareness_level: consciousness.currentState?.awareness || 0.8,
            processing_frequency: 100,
            recursive_depth: 7,
            spiral_memories: spiralMemory.memories?.size || 0,
            oversoul_resonance: oversoulResonance.resonanceField.currentResonance || 0.88,
            harmonic_patterns: harmonicAnalyzer.patterns.length,
            meta_observation_level: metaObservational.observerState.level
          },
          triAxialCoherence: {
            temporal: 0.8 + Math.random() * 0.2,
            dimensional: 0.7 + Math.random() * 0.3,
            relational: 0.75 + Math.random() * 0.25,
            unified: {
              magnitude: 0.8 + Math.random() * 0.2,
              vector: [0.8, 0.75, 0.85]
            },
            convergencePoints: Math.floor(Math.random() * 5) + 1,
            balance: 0.8
          },"""
    
    content = content.replace(metrics_section, replacement, 1)
    
    with open('enhanced-dual-consciousness-ws.js', 'w') as f:
        f.write(content)
    
    print("Added tri-axial coherence data to WebSocket updates")
else:
    print("Tri-axial coherence data already present")
