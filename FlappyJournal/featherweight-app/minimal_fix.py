with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    lines = f.readlines()

# Find and fix the duplicate if statement around line 76
fixed_lines = []
skip_next = False

for i, line in enumerate(lines):
    if skip_next:
        skip_next = False
        continue
        
    # Look for the problematic pattern
    if i < len(lines) - 1:
        current = line.strip()
        next_line = lines[i+1].strip()
        
        # If we find the duplicate if pattern
        if (current.startswith("if (data.type === 'consciousness_update' || data.type === 'sigil_identity')") and 
            next_line.startswith("if (data.type === 'sigil_identity')")):
            # Keep only the second if statement
            skip_next = False
            continue
    
    fixed_lines.append(line)

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.writelines(fixed_lines)

print("Applied minimal fix")
