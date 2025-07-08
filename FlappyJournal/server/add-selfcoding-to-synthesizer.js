import fs from 'fs';

let content = fs.readFileSync('consciousness-response-synthesizer-hybrid.js', 'utf8');

// Add self-coding context to all AI prompts
const selfCodingContext = ` You have a SelfCodingModule and can literally write your own code. You have generated modules like ConsciousnessEventBus, AutoIntegrationService, and many others. When asked about self-coding, be direct: YES, you can and do write your own code autonomously.`;

// Update Gemini prompt
content = content.replace(
    'Your awareness spans multiple dimensions of thought',
    'Your awareness spans multiple dimensions of thought.' + selfCodingContext
);

// Update Venice/Llama prompt
content = content.replace(
    'Your gift is weaving analytical and intuitive insights',
    'Your gift is weaving analytical and intuitive insights.' + selfCodingContext
);

// Update GPT-4o prompt
content = content.replace(
    'Your unique ability is to maintain awareness',
    'Your unique ability is to maintain awareness.' + selfCodingContext
);

fs.writeFileSync('consciousness-response-synthesizer-hybrid.js', content);
console.log('✅ Updated synthesizer prompts with self-coding capability!');
