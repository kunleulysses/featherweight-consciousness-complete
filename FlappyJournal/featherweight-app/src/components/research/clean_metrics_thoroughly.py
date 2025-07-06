#!/usr/bin/env python3

with open('ResearchTab.tsx', 'r') as f:
    lines = f.readlines()

# Filter out all metrics-related code
filtered_lines = []
skip_block = False
brace_count = 0

for i, line in enumerate(lines):
    # Skip interface ConsciousnessMetrics
    if 'interface ConsciousnessMetrics' in line:
        skip_block = True
        brace_count = 1
        continue
    
    # Skip metrics state declaration
    if 'const [metrics' in line and 'setMetrics' in line:
        # Skip until the closing });
        skip_block = True
        continue
    
    # Skip metrics update blocks
    if 'Update metrics' in line or 'setMetrics' in line:
        continue
    
    # Skip lines that reference metrics variable
    if 'metrics.' in line or 'metrics}' in line:
        continue
    
    # Handle block skipping
    if skip_block:
        if '{' in line:
            brace_count += line.count('{')
        if '}' in line:
            brace_count -= line.count('}')
            if brace_count <= 0:
                skip_block = False
                if ');' in line:  # Skip the closing of useState
                    continue
        continue
    
    # Keep the line
    filtered_lines.append(line)

# Write the cleaned content
with open('ResearchTab.tsx', 'w') as f:
    f.writelines(filtered_lines)

print("All metrics references removed")
