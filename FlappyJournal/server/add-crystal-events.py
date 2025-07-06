#!/usr/bin/env python3

with open('enhanced-dual-consciousness-ws.js', 'r') as f:
    content = f.read()

# Add crystal event broadcasting after crystal creation
crystal_broadcast = '''
            // Broadcast crystal formation to all connected clients
            wss.clients.forEach((client) => {
              if (client.readyState === ws.OPEN) {
                client.send(JSON.stringify({
                  type: 'crystal_formed',
                  crystal: {
                    id: crystal.id,
                    timestamp: new Date().toISOString(),
                    state: {
                      phi: consciousnessResult.consciousness.phi || 0,
                      awareness: consciousnessResult.consciousness.awarenessLevel || 0,
                      coherence: triAxialResult.unified.magnitude || 0,
                      resonance: oversoulResult.resonance || 0
                    },
                    signature: crystal.pattern.signature,
                    intensity: crystal.stability,
                    type: 'consciousness_peak'
                  }
                }));
              }
            });'''

# Find where crystallization happens and add the broadcast
import re

# Look for the crystallization result log
pattern = r'(console\.log\(\'Crystallization result:.*?\);)'
replacement = r'\1\n' + crystal_broadcast

content = re.sub(pattern, replacement, content, flags=re.MULTILINE)

with open('enhanced-dual-consciousness-ws.js', 'w') as f:
    f.write(content)

print("Added crystal event broadcasting")
