with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    content = f.read()

# Remove the duplicate interface content
# Find and remove everything between the first closing brace after SigilData and SigilIdentityProps
import re

# Pattern to match the malformed interface
pattern = r'(interface SigilData\s*\{[^}]+\})\s*\n\s*color:[^}]+\}'
replacement = r'\1'

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.write(content)

print("Cleaned up duplicate interface content")
