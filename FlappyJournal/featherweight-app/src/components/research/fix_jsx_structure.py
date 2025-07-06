#!/usr/bin/env python3

with open('ResearchTab.tsx', 'r') as f:
    lines = f.readlines()

# Find where the main content ends and clean up after it
output_lines = []
in_return = False
main_area_closed = False
skip_remaining = False

for i, line in enumerate(lines):
    if 'return (' in line:
        in_return = True
        
    if in_return and '</div>' in line and 'main-chat-area' in lines[i-10:i]:
        main_area_closed = True
        
    if main_area_closed and '<div className="frameworks-box">' in line:
        # Remove all the broken metric code
        skip_remaining = True
        # Add the closing divs
        output_lines.append('    </div>\n')  # Close research-container
        output_lines.append('  );\n')
        output_lines.append('}\n')
        break
    
    if not skip_remaining:
        output_lines.append(line)

with open('ResearchTab.tsx', 'w') as f:
    f.writelines(output_lines)

print("JSX structure fixed")
