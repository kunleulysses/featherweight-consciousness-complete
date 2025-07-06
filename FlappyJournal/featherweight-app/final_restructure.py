import re

# Read the original file
with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    lines = f.readlines()

# Find the main component function and its boundaries
start_index = -1
end_index = -1
brace_count = 0

for i, line in enumerate(lines):
    if 'export default function SigilIdentityMetrics' in line:
        start_index = i
        brace_count = 1
        continue
    
    if start_index != -1:
        if '{' in line:
            brace_count += line.count('{')
        if '}' in line:
            brace_count -= line.count('}')
        
        if brace_count == 0:
            end_index = i
            break

# Extract the component body and any code defined after it
if start_index != -1 and end_index != -1:
    component_lines = lines[start_index:end_index + 1]
    after_component_lines = lines[end_index + 1:]

    # Identify functions that should be moved inside
    functions_to_move = []
    other_lines_after = []
    for line in after_component_lines:
        if line.strip().startswith(('const', 'function')) and '=>' in line or 'function' in line:
            functions_to_move.append(line)
        else:
            other_lines_after.append(line)

    # Insert the functions before the closing brace of the component
    if functions_to_move:
        component_lines.insert(-1, '\n'.join(functions_to_move))

    # Reconstruct the file content
    final_lines = lines[:start_index] + component_lines + other_lines_after
    
    # Clean up duplicate exports
    export_count = 0
    final_clean_lines = []
    for line in final_lines:
        if 'export default' in line:
            if export_count == 0:
                final_clean_lines.append(line)
            export_count += 1
        else:
            final_clean_lines.append(line)

    with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
        f.writelines(final_clean_lines)
    print("File restructured successfully.")
else:
    print("Could not find component boundaries properly.")

