#!/usr/bin/env python3

with open('ResearchTab.css', 'r') as f:
    content = f.read()

# Add Georgia font family to the root research-tab container
import re

# Update the main container font
if '.research-tab {' in content:
    content = re.sub(
        r'(\.research-tab\s*{[^}]*)',
        r'\1\n  font-family: Georgia, serif;',
        content,
        count=1
    )
else:
    # Add the research-tab class if it doesn't exist
    content = '.research-tab {\n  font-family: Georgia, serif;\n}\n\n' + content

# Update specific elements to use Georgia
replacements = [
    (r'font-family:\s*[^;]+;', 'font-family: Georgia, serif;'),
    (r'font-family:\s*"[^"]+"\s*,\s*[^;]+;', 'font-family: Georgia, serif;'),
]

for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

# Remove metrics panel related styles
metrics_patterns = [
    r'\.metrics-panel\s*{[^}]*}',
    r'\.metrics-title\s*{[^}]*}',
    r'\.metric-item\s*{[^}]*}',
    r'\.metric-label\s*{[^}]*}',
    r'\.metric-value\s*{[^}]*}',
    r'\.metric-value\.large\s*{[^}]*}',
    r'\.progress-bar\s*{[^}]*}',
    r'\.progress-fill\s*{[^}]*}',
    r'\.progress-fill\.phi\s*{[^}]*}',
    r'\.progress-fill\.awareness\s*{[^}]*}',
    r'\.frameworks-box\s*{[^}]*}',
    r'\.frameworks-title\s*{[^}]*}',
    r'\.frameworks-list\s*{[^}]*}',
]

for pattern in metrics_patterns:
    content = re.sub(pattern, '', content, flags=re.DOTALL)

# Clean up extra newlines
content = re.sub(r'\n{3,}', '\n\n', content)

with open('ResearchTab.css', 'w') as f:
    f.write(content)

print("CSS updated with Georgia font and metrics styles removed")
