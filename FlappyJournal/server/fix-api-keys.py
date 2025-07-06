#!/usr/bin/env python3

with open('consciousness-response-synthesizer-hybrid.js', 'r') as f:
    content = f.read()

# Fix Gemini API key loading
content = content.replace(
    "const GEMINI_API_KEY = process.env.GEMINI_API_KEY;",
    "const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCxMuX_M1esABzvvJlS6drdbzmO6w9NJBE';"
)

# Fix the Gemini URL to use the key variable
content = content.replace(
    "const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;",
    "// Gemini API URL will be constructed with the key"
)

# Fix the Gemini API call to construct URL properly
old_gemini_call = """  const response = await axios.post(GEMINI_API_URL, prompt, {
    headers: { 'Content-Type': 'application/json' }
  });"""

new_gemini_call = """  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
  const response = await axios.post(GEMINI_URL, prompt, {
    headers: { 'Content-Type': 'application/json' }
  });"""

content = content.replace(old_gemini_call, new_gemini_call)

with open('consciousness-response-synthesizer-hybrid.js', 'w') as f:
    f.write(content)

print("Fixed API key issues")
