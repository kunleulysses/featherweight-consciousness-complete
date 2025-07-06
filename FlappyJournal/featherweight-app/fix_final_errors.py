with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    content = f.read()

# Fix timestamp to be a string
content = content.replace('timestamp: Date.now()', 'timestamp: new Date().toISOString()')

# Fix the intensity check
content = content.replace(
    '{(sigil.intensity * 100).toFixed(0)}%',
    '{((sigil.intensity || 0) * 100).toFixed(0)}%'
)

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.write(content)

print("Fixed final TypeScript errors")
