with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    content = f.read()

# Fix the duplicate if statement issue
# Replace the pattern where we have two nested if statements
import re

# Look for the problematic pattern and fix it
pattern = r'if \(data\.type === \'consciousness_update\' \|\| data\.type === \'sigil_identity\'\) \{\s*if \(data\.type === \'sigil_identity\'\)'
replacement = 'if (data.type === \'sigil_identity\')'

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Also need to handle the closing braces properly
# Find where we have the sigil_identity handler and make sure it transitions properly to consciousness_update
pattern2 = r'(setSigilHistory\(prev => \[\.\.\.prev\.slice\(-19\), newSigil\]\);)\s*return;\s*\}\s*// Original consciousness_update handler'
replacement2 = r'\1\n        return;\n      }\n      \n      // Original consciousness_update handler\n      if (data.type === \'consciousness_update\') {'

content = re.sub(pattern2, replacement2, content)

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.write(content)

print("Applied proper fix to duplicate if statements")
