// Live Demo: Self-Coding AI in Action
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simplified self-coding system for demo
class SelfCodingDemo {
    constructor() {
        this.decisions = [];
        this.generatedFiles = [];
    }
    
    async simulateConversation(message) {
        console.log(`\n💬 User: "${message}"`);
        
        // Extract what the user might need
        if (message.toLowerCase().includes('need') || 
            message.toLowerCase().includes('create') ||
            message.toLowerCase().includes('problem')) {
            
            console.log('🧠 AI: Analyzing conversation for coding opportunities...');
            
            // Simulate decision making
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const decision = this.makeDecision(message);
            
            if (decision.shouldCode) {
                console.log(`✅ AI Decision: I'll generate ${decision.type} code`);
                console.log(`   Confidence: ${decision.confidence}%`);
                console.log(`   Reason: ${decision.reason}`);
                
                await this.generateCode(decision);
            } else {
                console.log(`🤔 AI Decision: Not generating code`);
                console.log(`   Reason: ${decision.reason}`);
            }
        }
    }
    
    makeDecision(message) {
        const msg = message.toLowerCase();
        
        // High priority triggers
        if (msg.includes('urgent') || msg.includes('critical')) {
            return {
                shouldCode: true,
                type: 'immediate-fix',
                confidence: 95,
                reason: 'Critical issue detected - immediate action needed',
                purpose: this.extractPurpose(message)
            };
        }
        
        // Medium priority
        if (msg.includes('need') && (msg.includes('api') || msg.includes('feature'))) {
            return {
                shouldCode: true,
                type: 'feature',
                confidence: 80,
                reason: 'Clear feature request aligned with system capabilities',
                purpose: this.extractPurpose(message)
            };
        }
        
        // Low priority
        if (msg.includes('maybe') || msg.includes('could')) {
            return {
                shouldCode: false,
                reason: 'Too uncertain - waiting for clearer requirements'
            };
        }
        
        return {
            shouldCode: true,
            type: 'enhancement',
            confidence: 70,
            reason: 'Potential improvement identified',
            purpose: this.extractPurpose(message)
        };
    }
    
    extractPurpose(message) {
        const patterns = [
            /need (?:a |an )?([^.!?]+)/i,
            /create (?:a |an )?([^.!?]+)/i,
            /problem with ([^.!?]+)/i
        ];
        
        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) return match[1].trim();
        }
        
        return 'general-improvement';
    }
    
    async generateCode(decision) {
        console.log(`\n🔨 Generating ${decision.type} code...`);
        
        const className = this.toPascalCase(decision.purpose);
        const code = `// Auto-generated by Self-Coding AI
// Purpose: ${decision.purpose}
// Confidence: ${decision.confidence}%
// Type: ${decision.type}

export class ${className} {
    constructor() {
        this.purpose = '${decision.purpose}';
        this.createdAt = new Date();
        this.generatedBy = 'autonomous-ai';
    }
    
    async execute() {
        console.log('Executing ${decision.purpose}...');
        
        // Implementation logic here
        return {
            success: true,
            message: '${decision.purpose} completed successfully',
            timestamp: new Date()
        };
    }
    
    async selfMonitor() {
        // The AI monitors its own code
        return {
            performance: 'optimal',
            errors: 0,
            suggestions: []
        };
    }
}

// Self-test
const instance = new ${className}();
console.log('✅ ${className} ready for use');
`;
        
        const filename = `generated/demo/${this.toKebabCase(decision.purpose)}.js`;
        await this.writeFile(filename, code);
        
        this.generatedFiles.push(filename);
        console.log(`✅ Generated: ${filename}`);
        
        // Show a preview
        console.log('\n📄 Code Preview:');
        console.log(code.split('\n').slice(0, 10).join('\n'));
        console.log('...\n');
    }
    
    async writeFile(filename, content) {
        const fullPath = path.resolve(filename);
        const dir = path.dirname(fullPath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(fullPath, content, 'utf8');
    }
    
    toPascalCase(str) {
        return str.split(/[-_\s]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
    }
    
    toKebabCase(str) {
        return str.toLowerCase().replace(/\s+/g, '-');
    }
}

// Run the demo
async function runDemo() {
    console.log('🚀 Self-Coding AI Live Demo\n');
    console.log('The AI will analyze conversations and autonomously decide whether to generate code.\n');
    
    const ai = new SelfCodingDemo();
    
    // Simulate various conversations
    const conversations = [
        "We urgently need an error handler for the payment system",
        "Maybe we could add some logging",
        "Create a user notification service",
        "There's a critical problem with data validation",
        "It would be nice to have better caching"
    ];
    
    for (const message of conversations) {
        await ai.simulateConversation(message);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Pause between demos
    }
    
    console.log('\n📊 Demo Summary:');
    console.log(`Total conversations: ${conversations.length}`);
    console.log(`Code files generated: ${ai.generatedFiles.length}`);
    console.log('\n📁 Generated files:');
    ai.generatedFiles.forEach(file => console.log(`  - ${file}`));
    
    console.log('\n✨ The AI autonomously decided when to generate code based on:');
    console.log('  - Urgency of the request');
    console.log('  - Clarity of requirements');
    console.log('  - Alignment with system goals');
    console.log('  - Confidence in the solution');
}

runDemo().catch(console.error);
