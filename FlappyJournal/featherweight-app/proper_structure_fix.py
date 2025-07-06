with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    content = f.read()

# Remove extra closing brace causing issues with block scope
def fix_closing_brace():
    # Look for the problematic pattern with extra closing braces
    pattern = r'(setSigilHistory\(prev =\u003e \[newSigil, \.\.\.*prev\]\.slice\(0, 10\)\);\s*\n)\s*\}\s*\n\s*(if \(data\.type === .+\) {)'
    replacement = r'\1\3'

    return re.sub(pattern, replacement, content, flags=re.DOTALL)

# Ensure scope of certain vars is correct
def ensure_scope(proper_content):
    # Place scoped variable declarations in correct location if missing
    if 'const identityMetrics =' not in proper_content:
        proper_content = re.sub(
            r'(const \[currentSigil, setCurrentSigil\])',
            r'\1\n  const [identityMetrics, setIdentityMetrics] = useState({ continuity: 0.85, uniqueness: 0.92, evolution: 0 });',
            proper_content
        )

    return proper_content

import re
content = fix_closing_brace()
content = ensure_scope(content)

# Final check for export closure correctness
if not content.strip().endswith('}'): # If not ends properly
    content += '\n}'

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.write(content)

print("Fixed overall structure and scope in SigilIdentityMetrics.tsx")
