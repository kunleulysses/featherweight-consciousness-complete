#!/usr/bin/env python3

with open('ResearchTab.tsx', 'r') as f:
    lines = f.readlines()

# Find the start and end of the metrics panel section
start_idx = None
end_idx = None
brace_count = 0
in_metrics_panel = False

for i, line in enumerate(lines):
    if '{/* Metrics Panel */}' in line:
        start_idx = i
        in_metrics_panel = True
    elif in_metrics_panel:
        # Count braces to find the end of the metrics panel div
        brace_count += line.count('{')
        brace_count -= line.count('}')
        if '</div>' in line and brace_count == 0:
            end_idx = i + 1
            break

# Remove the metrics panel section
if start_idx is not None and end_idx is not None:
    new_lines = lines[:start_idx] + lines[end_idx:]
else:
    print("Metrics panel section not found")
    exit(1)

# Also remove the metrics state and related code
filtered_lines = []
skip = False
for i, line in enumerate(new_lines):
    # Skip metrics-related state and imports
    if 'ConsciousnessMetrics' in line or ('const [metrics' in line and 'setMetrics' in line):
        skip = True
        continue
    if skip and ');' in line:
        skip = False
        continue
    if skip:
        continue
    
    # Skip metrics update code
    if 'setMetrics' in line:
        continue
    
    # Keep the line
    filtered_lines.append(line)

# Write the modified content
with open('ResearchTab.tsx', 'w') as f:
    f.writelines(filtered_lines)

print("Metrics panel removed successfully")
