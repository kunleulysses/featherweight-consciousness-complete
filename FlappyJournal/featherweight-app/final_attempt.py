import re

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    content = f.read()

# Fix the duplicate if statement issue
content = re.sub(r'if \(data\.type === \'consciousness_update\' \|\| data\.type === \'sigil_identity\'\) \{\s*if \(data\.type === \'sigil_identity\'\)', 'if (data.type === \'sigil_identity\')', content)

# Add the null check for canvasRef.current correctly
content = re.sub(r'(const canvas = canvasRef.current;)', r'if (!canvasRef.current) {\n      return;\n    }\n    \1', content)

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.write(content)

print("Final attempt to fix the file.")
