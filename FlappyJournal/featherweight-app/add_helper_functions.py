with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    content = f.read()

# Add helper functions before the component
helper_functions = '''
// Helper function for sigil color generation
const generateSigilColor = (strength: number): string => {
  const hue = strength * 360;
  return 'hsl(' + hue + ', 70%, 50%)';
};

'''

# Insert before the component declaration
import_end = content.find('const SigilIdentityMetrics')
if import_end != -1:
    content = content[:import_end] + helper_functions + content[import_end:]

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.write(content)

print("Added helper functions")
