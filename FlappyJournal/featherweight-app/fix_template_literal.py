with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'r') as f:
    content = f.read()

# Fix the template literal issue
content = content.replace(
    "animationDelay: `${index * 0.1}s`",
    "animationDelay: `${index * 0.1}s`"
)

# Check if there's an actual issue with the backticks
import re
# Look for the specific line and ensure it's properly formatted
pattern = r'animationDelay:\s*`\$\{index\s*\*\s*0\.1\}s`'
if re.search(pattern, content):
    print("Template literal looks correct")
else:
    # Try to find and fix the issue
    content = re.sub(
        r'animationDelay:\s*[`"\']([^`"\']+)[`"\']',
        lambda m: f'animationDelay: `${{index * 0.1}}s`',
        content
    )

with open('src/components/dashboard/SigilIdentityMetrics.tsx', 'w') as f:
    f.write(content)

print("Fixed template literal issue")
