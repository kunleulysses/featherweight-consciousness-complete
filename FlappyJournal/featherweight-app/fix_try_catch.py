with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    lines = f.readlines()

# Find the problematic line and remove the extra closing brace
fixed_lines = []
for i, line in enumerate(lines):
    # Skip the extra closing brace before "if (data.type === 'sigil_created')"
    if i > 0 and lines[i].strip() == '}' and i + 1 < len(lines) and 'if (data.type === \'sigil_created\')' in lines[i + 2]:
        continue
    fixed_lines.append(line)

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.writelines(fixed_lines)

print("Fixed try-catch structure")
