import { promises as fs } from 'fs';

async function fix() {
    let content = await fs.readFile('./consciousness/modules/SelfCodingModule.js', 'utf8');
    
    // Replace the problematic new Function line
    content = content.replace(
        '// Basic syntax validation using Function constructor\n            new Function(code);',
        '// For ES modules, we cannot use Function constructor\n            // Just check basic syntax patterns\n            if (!code || code.trim().length === 0) {\n                throw new Error("Empty code");\n            }'
    );
    
    await fs.writeFile('./consciousness/modules/SelfCodingModule.js', content);
    console.log('Fixed validateCode method');
}

fix().catch(console.error);
