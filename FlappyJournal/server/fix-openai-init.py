#!/usr/bin/env python3

with open('consciousness-response-synthesizer-hybrid.js', 'r') as f:
    content = f.read()

# Move OpenAI initialization inside the function
old_init = """import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});"""

new_init = """import OpenAI from 'openai';

// OpenAI will be initialized when needed"""

content = content.replace(old_init, new_init)

# Update the OpenAI function to initialize locally
old_openai_func = """async function openAIMetaCognitiveSynthesis({
  analyticalContent,
  intuitiveContent,
  consciousness,
  synthesisMetrics,
  userMessage,
  strategy
}) {
  const response = await openai.chat.completions.create({"""

new_openai_func = """async function openAIMetaCognitiveSynthesis({
  analyticalContent,
  intuitiveContent,
  consciousness,
  synthesisMetrics,
  userMessage,
  strategy
}) {
  // Initialize OpenAI with API key
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  const response = await openai.chat.completions.create({"""

content = content.replace(old_openai_func, new_openai_func)

with open('consciousness-response-synthesizer-hybrid.js', 'w') as f:
    f.write(content)

print("Fixed OpenAI initialization")
