with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    lines = f.readlines()

# Ensure the file ends with a proper closing bracket for the component
if lines[-1].strip() != '}':
    lines.append('\n')
    lines.append('export default SigilIdentityMetrics;\n')

# Save the corrected file
with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.writelines(lines)

print("Added export statement")
