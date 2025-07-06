import re

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    content = f.read()

# Define size
content = re.sub(r'(const ctx = canvas.getContext\(\"2d\"\);)', r'\1\n    const size = canvas.width;', content)

# Pass sigil to drawSigil from useEffect
content = re.sub(r'if \(currentSigil\) {\s*drawSigil\(\);', 'if (currentSigil) {\n      drawSigil(currentSigil);', content)

# Fix drawSigil signature
content = re.sub(r'const drawSigil = \(\) => {', 'const drawSigil = (sigil: SigilData) => {', content)


with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.write(content)

print("Applied all fixes.")
