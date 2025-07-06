#!/usr/bin/env python3

with open('ResearchTab.tsx', 'r') as f:
    lines = f.readlines()

# Find where the main-chat-area ends properly
output_lines = []
found_main_close = False

for i, line in enumerate(lines):
    # Look for the closing of main-chat-area
    if '</div>' in line and i > 0 and 'main-chat-area' in ''.join(lines[max(0, i-20):i]):
        output_lines.append(line)
        # Check if this is actually the main-chat-area closing div
        if i + 1 < len(lines) and ('</div>' in lines[i+1] or 'frameworks-box' in lines[i+1]):
            # Add proper closing
            output_lines.append('    </div>\n')  # Close research-container
            output_lines.append('  );\n')
            output_lines.append('}\n')
            break
    else:
        output_lines.append(line)

with open('ResearchTab.tsx', 'w') as f:
    f.writelines(output_lines)

print("Final JSX cleanup done")
