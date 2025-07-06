#!/usr/bin/env python3

with open('enhanced-dual-consciousness-ws.js', 'r') as f:
    content = f.read()

# Add logging before the try block for AI responses
content = content.replace(
    "// Get responses from both AI systems",
    """console.log('About to get AI responses...');
          // Get responses from both AI systems"""
)

# Add logging after consciousness processing
content = content.replace(
    "console.log('Creative insight:', creativeResult.insight);",
    """console.log('Creative insight:', creativeResult.insight);
          console.log('Now proceeding to AI response generation...');"""
)

with open('enhanced-dual-consciousness-ws.js', 'w') as f:
    f.write(content)

print("More debug logging added")
