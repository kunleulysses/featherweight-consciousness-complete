#!/usr/bin/env python3

with open('ResearchTab.tsx', 'r') as f:
    content = f.read()

# Remove the ConsciousnessMetrics interface
import re
content = re.sub(r'interface ConsciousnessMetrics \{[^}]*\}', '', content, flags=re.DOTALL)

# Remove the metrics state
content = re.sub(r'const \[metrics, setMetrics\] = useState<ConsciousnessMetrics>\([^)]*\);', '', content, flags=re.DOTALL)

# Remove metrics updates in message handlers
content = re.sub(r'// Update metrics if provided.*?setMetrics\([^)]*\);.*?\}', '', content, flags=re.DOTALL)
content = re.sub(r'if \(data\.consciousness\).*?setMetrics\([^)]*\);.*?\}', '', content, flags=re.DOTALL)
content = re.sub(r'} else if \(data\.type === \'consciousness_update\'\).*?setMetrics\([^)]*\);.*?\}', '}', content, flags=re.DOTALL)

# Remove the entire metrics panel section
content = re.sub(r'{/\* Metrics Panel \*/}.*?</div>\s*</div>\s*(?=</div>)', '', content, flags=re.DOTALL)

# Clean up extra newlines
content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)

with open('ResearchTab.tsx', 'w') as f:
    f.write(content)

print("Metrics removed carefully")
