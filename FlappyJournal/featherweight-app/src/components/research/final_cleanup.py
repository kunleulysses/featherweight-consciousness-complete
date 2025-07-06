#!/usr/bin/env python3

with open('ResearchTab.tsx', 'r') as f:
    content = f.read()

# Remove any remaining metric-related code blocks
import re

# Remove metric update blocks in message handling
content = re.sub(r'//.*Update metrics.*\n.*if\s*\(data\.metrics\)\s*{[^}]*}', '', content, flags=re.DOTALL)
content = re.sub(r'if\s*\(data\.metrics\)\s*{[^}]*}', '', content, flags=re.DOTALL)

# Remove any remaining metric divs
content = re.sub(r'<div className="metric-[^"]*"[^>]*>.*?</div>', '', content, flags=re.DOTALL)

# Clean up empty lines
content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)

with open('ResearchTab.tsx', 'w') as f:
    f.write(content)

print("Final cleanup completed")
