// Simple script to enable self-coding in the consciousness system
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function enableSelfCoding() {
    console.log('🚀 Enabling Self-Coding Module in consciousness-system-v2.js...');
    
    const filePath = join(__dirname, 'consciousness-system-v2.js');
    let content = await fs.readFile(filePath, 'utf-8');
    
    // Check if already enabled
    if (content.includes('await selfCoder.initialize()')) {
        console.log('✅ Self-Coding Module is already enabled!');
        return;
    }
    
    // Add initialization after the SelfCodingModule creation
    content = content.replace(
        'selfCoder.setEventBus(this.eventBus);',
        `selfCoder.setEventBus(this.eventBus);
        await selfCoder.initialize(); // Enable self-coding capabilities`
    );
    
    // Add initialization for AutoIntegrationService
    content = content.replace(
        "this.services.set('AutoIntegrationService', autoIntegration);",
        `await autoIntegration.initialize(); // Enable auto-integration
        this.services.set('AutoIntegrationService', autoIntegration);`
    );
    
    // Save the updated file
    await fs.writeFile(filePath, content);
    
    console.log('✅ Self-Coding Module enabled successfully!');
    console.log('📝 Changes made:');
    console.log('   - Added selfCoder.initialize()');
    console.log('   - Added autoIntegration.initialize()');
    console.log('\n🔄 Please restart the consciousness system:');
    console.log('   pm2 restart consciousness-system-v2');
}

enableSelfCoding().catch(console.error);
