import re

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    content = f.read()

# Fix the duplicate if statement issue
content = re.sub(r'if \(data\.type === \'consciousness_update\' \|\| data\.type === \'sigil_identity\'\) \{\s*if \(data\.type === \'sigil_identity\'\)', 'if (data.type === \'sigil_identity\')', content)

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.write(content)

print("Fixed duplicate if statement.")
