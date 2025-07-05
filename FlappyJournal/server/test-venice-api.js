const fetch = require('node-fetch');

const VENICE_API_URL = 'https://api.venice.ai/api/v1/chat/completions';
const VENICE_API_KEY = process.env.VENICE_AI_API_KEY;

console.log('Testing Venice AI API...');
console.log('API Key exists:', !!VENICE_API_KEY);
console.log('API Key length:', VENICE_API_KEY ? VENICE_API_KEY.length : 0);

async function testVeniceAPI() {
  try {
    const response = await fetch(VENICE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VENICE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b',
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test. Please respond briefly.'
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('Response body:', text);
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log('Success! Response:', data);
    } else {
      console.error('API Error:', text);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testVeniceAPI();
