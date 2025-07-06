with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    lines = f.readlines()

# Move functions inside the main component function
inside_component = False
corrected_lines = []

for line in lines:
    # Check if we're inside the component function
    if 'export default function SigilIdentityMetrics' in line:
        inside_component = True
    if '}' in line and line.strip() == '}':
        inside_component = False
        corrected_lines.append(line)
        continue

    # If we're inside the component function, check for functions
    if inside_component:
        if line.strip().startswith('const ') and '=>' in line:
            # It's a function; ensure it's indented correctly
            corrected_lines.append('  ' + line)
        else:
            corrected_lines.append(line)
    else:
        corrected_lines.append(line)

# Adding missing exports and cleanup
corrected_lines.append('\nexport default SigilIdentityMetrics;\n')

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.writelines(corrected_lines)

print("Reorganized component structure")
