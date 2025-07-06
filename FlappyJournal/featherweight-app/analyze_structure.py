with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    lines = f.readlines()

# Find where the component function starts
component_start = -1
for i, line in enumerate(lines):
    if 'export default function SigilIdentityMetrics' in line:
        component_start = i
        break

print(f"Component starts at line {component_start + 1}")

# Look for where functions are defined that should be inside the component
for i in range(component_start + 10, min(component_start + 200, len(lines))):
    line = lines[i].strip()
    if line.startswith('const ') and ('generateSigil' in line or 'drawSigil' in line):
        print(f"Found function at line {i + 1}: {line[:50]}")
