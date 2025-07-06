with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    content = f.read()

# Replace the backgroundImage template literal
content = content.replace(
    "backgroundImage: `url(${getMiniSigilCanvas(sigil)})`,",
    "backgroundImage: 'url(' + getMiniSigilCanvas(sigil) + ')',"
)

# Fix any other template literals in the file that might be causing issues
import re

# Find all template literals and convert them to string concatenation
def replace_template(match):
    template = match.group(0)
    # Extract the content inside the template literal
    inner = template[1:-1]  # Remove backticks
    
    # Replace ${...} with ' + ... + '
    result = re.sub(r'\$\{([^}]+)\}', r"' + \1 + '", inner)
    
    # Wrap in quotes
    return "'" + result + "'"

# Only replace template literals that contain ${...}
content = re.sub(r'`[^`]*\$\{[^`]+}`', replace_template, content)

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.write(content)

print("Fixed all template literals")
