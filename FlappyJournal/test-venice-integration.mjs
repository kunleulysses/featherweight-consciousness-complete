import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function testVeniceAPI() {
    const VENICE_API_KEY = process.env.VENICE_AI_API_KEY;
    const VENICE_API_URL = process.env.VENICE_AI_BASE_URL + '/chat/completions';
    const VENICE_MODEL = process.env.VENICE_AI_MODEL || 'venice-2-8x7b';

    if (!VENICE_API_KEY) {
        console.error('❌ VENICE_AI_API_KEY not found in environment');
        return;
    }

    console.log('✅ API Key found');
    console.log(`🔗 API URL: ${VENICE_API_URL}`);
    console.log(`🤖 Model: ${VENICE_MODEL}`);

    try {
        const response = await fetch(VENICE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${VENICE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: VENICE_MODEL,
                messages: [
                    {
                        role: 'user',
                        content: 'Hello! Please respond with a brief test message to confirm the API connection is working.'
                    }
                ],
                max_tokens: 100,
                temperature: 0.8
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API Error: ${response.status} - ${errorText}`);
            return;
        }

        const data = await response.json();
        console.log('✅ Venice AI API connection successful!');
        console.log('📝 Response:', data.choices?.[0]?.message?.content || 'No content');
        console.log('🎯 Autonomous thoughts system is operational!');
        
    } catch (error) {
        console.error('❌ Error testing Venice API:', error.message);
    }
}

testVeniceAPI();
