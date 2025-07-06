import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function fixSelfCodingInit() {
    console.log('🔧 Fixing SelfCodingModule initialization...');
    
    const filePath = join(__dirname, 'consciousness-system-v2.js');
    let content = await fs.readFile(filePath, 'utf-8');
    
    // Remove the incorrect initialize call
    content = content.replace(
        'await selfCoder.initialize(); // Enable self-coding capabilities',
        '// SelfCodingModule doesn\'t need explicit initialization'
    );
    
    // Save the fixed file
    await fs.writeFile(filePath, content);
    
    console.log('✅ Fixed! SelfCodingModule will be ready on instantiation.');
}

fixSelfCodingInit().catch(console.error);
