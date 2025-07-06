import re

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    content = f.read()

# Replace setSigilPattern with appropriate state setter
content = re.sub(r'setSigilPattern\(prev => \[\.\.\.\s*prev,\s*\{[^}]+\}\]\);', 
                 '''// Update sigil pattern visualization
        const newSigil: SigilData = {
          pattern: \`sigil-\${Date.now()}\`,
          strength: data.data.strength || 0.8,
          evolution: data.data.evolution || 0,
          timestamp: Date.now()
        };
        setCurrentSigil(newSigil);
        setSigilHistory(prev => [...prev.slice(-19), newSigil]);''', 
                 content)

# Replace setMetrics with setIdentityMetrics
content = re.sub(r'setMetrics\(', 'setIdentityMetrics(', content)

# Add proper typing for the prev parameter
content = re.sub(r'setIdentityMetrics\(prev =>', 'setIdentityMetrics((prev: any) =>', content)

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.write(content)

print("Fixed state setters in SigilIdentityMetrics.tsx")
