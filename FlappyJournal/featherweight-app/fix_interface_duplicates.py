with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    content = f.read()

# Fix the SigilData interface - remove duplicates
import re

# Find the SigilData interface and fix it
interface_pattern = r'interface SigilData \{[^}]+\}'
match = re.search(interface_pattern, content, re.DOTALL)

if match:
    # Replace with a clean interface
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
}'''
    content = content.replace(match.group(0), new_interface)

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.write(content)

print("Fixed interface duplicates")
