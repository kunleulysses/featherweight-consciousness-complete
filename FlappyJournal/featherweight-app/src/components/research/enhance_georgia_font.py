#!/usr/bin/env python3

with open('ResearchTab.css', 'r') as f:
    content = f.read()

# Add comprehensive Georgia font styling
georgia_styles = """
/* Georgia Font Family Applied Throughout */
.research-tab,
.research-tab * {
  font-family: Georgia, serif;
}

.message-content,
.message-item,
.chat-input,
.send-button,
.input-container input {
  font-family: Georgia, serif;
}

/* Elegant typography settings */
.research-tab {
  font-size: 16px;
  line-height: 1.6;
  letter-spacing: 0.02em;
}

.message-content {
  font-size: 15px;
  line-height: 1.7;
}

.chat-input {
  font-size: 15px;
}

h1, h2, h3, h4, h5, h6 {
  font-family: Georgia, serif;
  font-weight: normal;
  letter-spacing: 0.03em;
}

"""

# Insert the Georgia styles at the beginning after imports
import_end = content.find('@import')
if import_end != -1:
    import_line_end = content.find('\n', import_end)
    content = content[:import_line_end+1] + '\n' + georgia_styles + content[import_line_end+1:]
else:
    content = georgia_styles + '\n' + content

with open('ResearchTab.css', 'w') as f:
    f.write(content)

print("Georgia font styling enhanced")
