#!/usr/bin/env python3

with open('ResearchTab.tsx', 'r') as f:
    content = f.read()

# Remove the broken metric update code
import re

# Find and remove the broken consciousness update block
content = re.sub(
    r'if \(data\.consciousness\) \{[^}]*\}\);[^}]*\}',
    '',
    content,
    flags=re.DOTALL
)

# Remove other broken metric references
content = re.sub(
    r'phi: data\.consciousness\.phiValue.*?\}\);',
    '',
    content,
    flags=re.DOTALL
)

# Remove orphaned closing braces and semicolons
content = re.sub(r'\n\s*\)\;\s*\n\s*\}', '', content)
content = re.sub(r'} else if \(data\.type === \'consciousness_update\'\) \{\s*\)\;\s*\}', '}', content)

# Clean up extra whitespace
content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)

with open('ResearchTab.tsx', 'w') as f:
    f.write(content)

print("Syntax fixed")
