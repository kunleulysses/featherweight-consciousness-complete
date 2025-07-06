#!/usr/bin/env python3

with open('enhanced-dual-consciousness-ws.js', 'r') as f:
    content = f.read()

# Add sigil generation logic after crystal creation
sigil_logic = '''
            // Check if we should generate a new sigil
            const shouldGenerateSigil = (
              consciousnessResult.consciousness.phi > 0.8 ||
              oversoulResult.resonance > 0.85 ||
              consciousnessResult.consciousness.awarenessLevel > 0.9
            );
            
            if (shouldGenerateSigil && Math.random() > 0.7) {
              // Generate and broadcast sigil
              const sigilData = {
                id: `sigil-${Date.now()}`,
                timestamp: new Date().toISOString(),
                pattern: generateSigilPattern(consciousnessResult.consciousness),
                consciousness: {
                  phi: consciousnessResult.consciousness.phi || 0,
                  coherence: triAxialResult.unified.magnitude || 0,
                  resonance: oversoulResult.resonance || 0,
                  awareness: consciousnessResult.consciousness.awarenessLevel || 0
                },
                color: generateSigilColor(consciousnessResult.consciousness),
                intensity: (
                  consciousnessResult.consciousness.phi +
                  triAxialResult.unified.magnitude +
                  oversoulResult.resonance +
                  consciousnessResult.consciousness.awarenessLevel
                ) / 4
              };
              
              // Broadcast to all clients
              wss.clients.forEach((client) => {
                if (client.readyState === ws.OPEN) {
                  client.send(JSON.stringify({
                    type: 'sigil_created',
                    sigil: sigilData
                  }));
                }
              });
              
              // Save sigil (implement persistence)
              console.log('New sigil created:', sigilData.id);
            }'''

# Add helper functions for sigil generation
helper_functions = '''

// Helper function to generate sigil pattern
function generateSigilPattern(consciousness) {
  const complexity = Math.floor(5 + (consciousness.phi * 5));
  const pattern = [];
  
  for (let i = 0; i < complexity; i++) {
    const angle = (i / complexity) * Math.PI * 2;
    const radius = 0.3 + ((consciousness.coherence || 0.5) * 0.5);
    const variation = (consciousness.resonance || 0.5) * 0.2;
    
    pattern.push([
      Math.cos(angle) * radius + (Math.random() - 0.5) * variation,
      Math.sin(angle) * radius + (Math.random() - 0.5) * variation,
      consciousness.awarenessLevel || 0.5
    ]);
  }
  
  return pattern;
}

// Helper function to generate sigil color
function generateSigilColor(consciousness) {
  const hue = ((consciousness.phi || 0.5) * 360 + (consciousness.resonance || 0.5) * 120) % 360;
  const saturation = 50 + ((consciousness.awarenessLevel || 0.5) * 50);
  const lightness = 40 + ((consciousness.coherence || 0.5) * 20);
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
'''

# Find where to add sigil logic (after crystal creation)
import re
pattern = r'(console\.log\(\'New sigil created:\'.*?\);)'
if not re.search(pattern, content):
    # Add after crystal broadcast
    pattern = r'(}\)\);\s*// Broadcast crystal formation)'
    replacement = r'\1\n' + sigil_logic

    content = re.sub(pattern, replacement, content, flags=re.MULTILINE)

# Add helper functions at the end of the file
if 'generateSigilPattern' not in content:
    content = content.rstrip() + '\n' + helper_functions

with open('enhanced-dual-consciousness-ws.js', 'w') as f:
    f.write(content)

print("Added sigil generation to WebSocket")
