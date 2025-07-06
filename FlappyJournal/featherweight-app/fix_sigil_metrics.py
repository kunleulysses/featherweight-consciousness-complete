import re

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    content = f.read()

# Fix the duplicate if statement issue
# Replace the problematic section with the corrected version
old_pattern = r'''if \(data\.type === 'consciousness_update' \|\| data\.type === 'sigil_identity'\) \{
      if \(data\.type === 'sigil_identity'\) \{'''

new_pattern = '''if (data.type === 'sigil_identity') {'''

content = re.sub(old_pattern, new_pattern, content)

# Also need to remove the extra closing brace and fix the comment placement
content = re.sub(r'\s+return;\s+\}\s+// Original consciousness_update handler', 
                 '\n        return;\n      }\n      \n      // Original consciousness_update handler\n      if (data.type === \'consciousness_update\') {', 
                 content)

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.write(content)

print("Fixed SigilIdentityMetrics.tsx")
