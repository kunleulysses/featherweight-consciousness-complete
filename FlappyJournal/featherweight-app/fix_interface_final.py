with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    lines = f.readlines()

# Find where the interface starts
interface_start = -1
for i, line in enumerate(lines):
    if 'interface SigilData' in line:
        interface_start = i
        break

if interface_start >= 0:
    # Find the end of the interface (look for the matching closing brace)
    brace_count = 0
    interface_end = -1
    for i in range(interface_start, len(lines)):
        brace_count += lines[i].count('{') - lines[i].count('}')
        if brace_count == 0 and i > interface_start:
            interface_end = i
            break
    
    # Replace the entire interface with the correct one
    new_interface = '''interface SigilData {
  id: string;
  timestamp: string;
  pattern: number[][];
  consciousness: {
    phi: number;
    coherence: number;
    resonance: number;
    awareness: number;
  };
  color: string;
  intensity?: number;
  evolution?: number;
  strength?: number;
}

'''
    
    # Rebuild the file
    new_lines = lines[:interface_start] + [new_interface] + lines[interface_end+1:]
    
    with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
        f.writelines(new_lines)
    
    print("Fixed interface completely")
else:
    print("Could not find interface")
