with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    lines = f.readlines()

# Find and fix the duplicate evolution property
fixed_lines = []
seen_evolution = False
for line in lines:
    if 'evolution?: number;' in line and seen_evolution:
        continue  # Skip duplicate
    elif 'evolution' in line and 'interface SigilData' in ''.join(lines[max(0, lines.index(line)-10):lines.index(line)]):
        seen_evolution = True
    fixed_lines.append(line)

content = ''.join(fixed_lines)

# Fix the newSigil object to have all required properties
newSigil_fix = '''const newSigil: SigilData = {
          id: 'sigil-' + Date.now(),
          timestamp: new Date().toISOString(),
          pattern: [[1, 0, 1], [0, 1, 0], [1, 0, 1]], // Simple pattern
          consciousness: {
            phi: data.data.phi || 0.5,
            coherence: data.data.coherence || 0.5,
            resonance: data.data.resonance || 0.5,
            awareness: data.data.awareness || 0.5
          },
          color: generateSigilColor(data.data.strength || 0.8),
          intensity: data.data.strength || 0.8,
          evolution: data.data.evolution || 0,
          strength: data.data.strength || 0.8
        };'''

# Replace the existing newSigil declaration
import re
pattern = r'const newSigil: SigilData = \{[^}]+\};'
content = re.sub(pattern, newSigil_fix, content, flags=re.DOTALL)

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.write(content)

print("Fixed all SigilData errors")
