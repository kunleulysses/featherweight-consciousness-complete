#!/usr/bin/env python3

with open('consciousness-response-synthesizer-hybrid.js', 'r') as f:
    content = f.read()

# Add dotenv loading at the top
new_imports = """import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

"""

# Add at the beginning
content = new_imports + content

with open('consciousness-response-synthesizer-hybrid.js', 'w') as f:
    f.write(content)

print("Environment loading added to synthesizer")
