import { promises as fs } from 'fs';

async function updateConfig() {
    const filePath = './consciousness-system.js';
    let content = await fs.readFile(filePath, 'utf8');
    
    // Lower the code generation threshold to be more proactive
    content = content.replace(
        'codeGenerationThreshold: 0.7',
        'codeGenerationThreshold: 0.4'
    );
    
    // Increase check interval for faster responses
    content = content.replace(
        'checkInterval: 30000, // 30 seconds',
        'checkInterval: 15000, // 15 seconds'
    );
    
    await fs.writeFile(filePath, content);
    console.log('Updated consciousness configuration');
}

updateConfig().catch(console.error);
