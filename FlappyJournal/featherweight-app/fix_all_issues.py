with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    content = f.read()

# Fix the invalid character issue - remove the literal \n
content = content.replace(';\\n    if (!canvas) return;', ';\n    if (!canvas) return;')

# Replace setSigilPattern and setMetrics with correct state setters
# These should be using the existing state setters
content = content.replace('setSigilPattern(prev => [...prev, {', '// Update sigil visualization\n        const newSigilData = {')
content = content.replace('}]);', '};\n        // Store the new sigil data')
content = content.replace('setMetrics(prev => ({', 'setIdentityMetrics(prev => ({')

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.write(content)

print("Fixed all identified issues")
