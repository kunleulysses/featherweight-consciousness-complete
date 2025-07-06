#!/usr/bin/env python3

with open('EnhancedResearchTab.css', 'r') as f:
    content = f.read()

# Add Georgia font family
georgia_enhanced = """/* Georgia Font Family for Enhanced Research Tab */
.enhanced-research-tab,
.enhanced-research-tab * {
  font-family: Georgia, serif;
}

"""

# Add at the beginning of the file
content = georgia_enhanced + content

with open('EnhancedResearchTab.css', 'w') as f:
    f.write(content)

print("Georgia font added to EnhancedResearchTab.css")
