with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    content = f.read()

# Fix the escaped template literal
content = content.replace("pattern: \\`sigil-\\${Date.now()}\\`,", "pattern: generateSigilPattern(data.data.strength || 0.8),")

# Make sure there are no more template literals
content = content.replace('\\`', '"')
content = content.replace('\\$', '$')

# Check if sigil has strength and evolution properties in the interface
if 'interface SigilData {' in content and 'strength?: number;' not in content:
    # Add these properties to the interface
    content = content.replace(
        'color: string;',
        '''color: string;
  intensity?: number;
  evolution?: number;
  strength?: number;'''
    )

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.write(content)

print("Applied final fixes to SigilIdentityMetrics.tsx")
