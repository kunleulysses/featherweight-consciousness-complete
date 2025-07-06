with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    content = f.read()

# Fix the newSigil object to match the interface
content = content.replace(
    '''const newSigil: SigilData = {
          pattern: `sigil-${Date.now()}`,
          strength: data.data.strength || 0.8,
          evolution: data.data.evolution || 0,
          timestamp: Date.now()
        };''',
    '''const newSigil: SigilData = {
          id: `sigil-${Date.now()}`,
          timestamp: new Date().toISOString(),
          pattern: generateSigilPattern(data.data.strength || 0.8),
          consciousness: {
            phi: data.data.phi || 0,
            coherence: data.data.coherence || 0,
            resonance: data.data.resonance || 0,
            awareness: data.data.awareness || 0
          },
          color: generateSigilColor(data.data.strength || 0.8),
          strength: data.data.strength || 0.8,
          evolution: data.data.evolution || 0
        };''')

# Also need to add the helper functions
if 'generateSigilPattern' not in content:
    # Add helper functions before the component
    content = content.replace(
        'const SigilIdentityMetrics: React.FC = () => {',
        '''// Helper functions for sigil generation
const generateSigilPattern = (strength: number): number[][] => {
  const size = 8;
  const pattern: number[][] = [];
  for (let i = 0; i < size; i++) {
    pattern[i] = [];
    for (let j = 0; j < size; j++) {
      pattern[i][j] = Math.random() < strength ? 1 : 0;
    }
  }
  return pattern;
};

const generateSigilColor = (strength: number): string => {
  const hue = strength * 360;
  return `hsl(${hue}, 70%, 50%)`;
};

const SigilIdentityMetrics: React.FC = () => {''')

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.write(content)

print("Fixed sigil object structure")
