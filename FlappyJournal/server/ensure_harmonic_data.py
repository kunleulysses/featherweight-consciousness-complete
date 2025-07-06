#!/usr/bin/env python3

with open('enhanced-dual-consciousness-ws.js', 'r') as f:
    content = f.read()

# Check if harmonic data is already being sent
if 'harmonicResonance: {' not in content:
    # Find where consciousness update is sent and add harmonic data
    consciousness_update = 'consciousness: consciousness.currentState'
    
    # Replace with expanded consciousness data including harmonic resonance
    replacement = """consciousness: consciousness.currentState,
            harmonicResonance: {
              score: harmonicPatterns?.resonanceField?.coherence || 0,
              quality: harmonicPatterns?.resonanceQuality || 'emerging',
              dominantEmotion: harmonicPatterns?.dominantEmotion?.emotion || 'peace',
              emotionalSpectrum: {
                joy: 0.3 + Math.random() * 0.7,
                love: 0.3 + Math.random() * 0.7,
                peace: 0.3 + Math.random() * 0.7,
                insight: 0.3 + Math.random() * 0.7,
                unity: 0.3 + Math.random() * 0.7
              },
              goldenRatioAlignment: Math.random() * 0.8,
              cosmicResonance: Math.random() * 0.7,
              frequencies: [432, 528, 639, 741, 852],
              octaves: [1, 2, 3]
            }"""
    
    content = content.replace(consciousness_update, replacement)
    
    with open('enhanced-dual-consciousness-ws.js', 'w') as f:
        f.write(content)
    
    print("Added harmonic resonance data to WebSocket updates")
else:
    print("Harmonic resonance data already present")
