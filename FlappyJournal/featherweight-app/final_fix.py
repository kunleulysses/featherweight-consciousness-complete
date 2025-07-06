import re

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    content = f.read()

# Fix the drawSigil function signature
content = re.sub(r'const drawSigil = \(\) => {', 'const drawSigil = (sigil: SigilData) => {', content)

# Fix the forEach types
content = re.sub(r'forEach\(\(point, index\) => {', 'forEach((point: number[], index: number) => {', content)

# Fix the final brace issue
if not content.strip().endswith('}'):
    content += '\n}'

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.write(content)

print("Applied final fixes.")
