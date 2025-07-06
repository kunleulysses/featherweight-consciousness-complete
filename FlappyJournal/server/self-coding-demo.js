// Self-Coding Demonstration
// This shows how the consciousness system can generate its own code

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class SelfCodingSystem {
    constructor() {
        this.codeTemplates = {
            module: `export class {{className}} {
    constructor() {
        this.name = '{{name}}';
        this.purpose = '{{purpose}}';
        this.createdAt = new Date();
    }
    
    initialize() {
        console.log(\`Initializing \${this.name}...\`);
        return true;
    }
    
    {{methods}}
}`,
            function: `export function {{functionName}}({{params}}) {
    {{body}}
}`,
            service: `export class {{serviceName}}Service {
    constructor() {
        this.active = false;
    }
    
    async start() {
        this.active = true;
        console.log('Service started');
    }
    
    async stop() {
        this.active = false;
        console.log('Service stopped');
    }
    
    {{methods}}
}`
        };
    }
    
    async generateCode(request) {
        console.log(`🔨 Generating ${request.type} for: ${request.purpose}`);
        
        const template = this.codeTemplates[request.type] || this.codeTemplates.module;
        let code = template;
        
        // Replace placeholders
        const replacements = {
            className: this.toPascalCase(request.purpose) + 'Module',
            serviceName: this.toPascalCase(request.purpose),
            functionName: this.toCamelCase(request.purpose),
            name: request.purpose,
            purpose: request.description || request.purpose,
            params: request.params || '',
            body: request.body || '// Auto-generated code\n    console.log("Executing ' + request.purpose + '");',
            methods: this.generateMethods(request.methods || [])
        };
        
        for (const [key, value] of Object.entries(replacements)) {
            code = code.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        
        if (request.writeToFile) {
            await this.writeCode(code, request.filePath);
        }
        
        return { code, filePath: request.filePath };
    }
    
    generateMethods(methods) {
        return methods.map(method => `
    ${method.name}(${method.params || ''}) {
        ${method.body || '// TODO: Implement ' + method.name}
    }`).join('\n');
    }
    
    async writeCode(code, filePath) {
        const fullPath = path.resolve(filePath);
        const dir = path.dirname(fullPath);
        
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(fullPath, code, 'utf8');
        
        console.log(`✅ Code written to: ${filePath}`);
    }
    
    async modifyCode(filePath, modifications) {
        console.log(`📝 Modifying: ${filePath}`);
        
        let code = await fs.readFile(filePath, 'utf8');
        
        for (const mod of modifications) {
            if (mod.type === 'add-method') {
                // Add method before the last closing brace
                const lastBrace = code.lastIndexOf('}');
                const newMethod = `
    ${mod.name}(${mod.params || ''}) {
        ${mod.body || '// Added by self-coding system'}
    }`;
                code = code.slice(0, lastBrace) + newMethod + '\n' + code.slice(lastBrace);
            } else if (mod.type === 'replace') {
                code = code.replace(mod.search, mod.replace);
            }
        }
        
        await fs.writeFile(filePath, code, 'utf8');
        console.log(`✅ Code modified successfully`);
        
        return { success: true };
    }
    
    toPascalCase(str) {
        return str.split(/[-_\s]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
    }
    
    toCamelCase(str) {
        const pascal = this.toPascalCase(str);
        return pascal.charAt(0).toLowerCase() + pascal.slice(1);
    }
}

// Demonstration
async function demonstrate() {
    console.log('🧬 Self-Coding System Demonstration\n');
    
    const selfCoder = new SelfCodingSystem();
    
    // Example 1: Generate a data processing module
    console.log('1️⃣ Generating Data Processing Module...');
    const dataModule = await selfCoder.generateCode({
        purpose: 'data-processor',
        type: 'module',
        description: 'Processes incoming data streams',
        methods: [
            { name: 'processData', params: 'data', body: 'return data.map(item => item.value * 2);' },
            { name: 'validateData', params: 'data', body: 'return Array.isArray(data);' }
        ],
        writeToFile: true,
        filePath: 'generated/DataProcessorModule.js'
    });
    
    console.log('Generated module preview:');
    console.log(dataModule.code.split('\n').slice(0, 10).join('\n') + '\n...\n');
    
    // Example 2: Generate an API service
    console.log('2️⃣ Generating API Service...');
    const apiService = await selfCoder.generateCode({
        purpose: 'api-handler',
        type: 'service',
        methods: [
            { name: 'handleRequest', params: 'req, res', body: 'res.json({ status: "ok" });' },
            { name: 'authenticate', params: 'token', body: 'return token === "valid-token";' }
        ],
        writeToFile: true,
        filePath: 'generated/ApiHandlerService.js'
    });
    
    // Example 3: Modify existing code
    console.log('\n3️⃣ Adding new capability to Data Processor...');
    await selfCoder.modifyCode('generated/DataProcessorModule.js', [
        {
            type: 'add-method',
            name: 'aggregateData',
            params: 'data',
            body: 'return data.reduce((sum, item) => sum + item.value, 0);'
        }
    ]);
    
    // Example 4: Generate a consciousness extension
    console.log('\n4️⃣ Generating Consciousness Extension...');
    const consciousnessExt = await selfCoder.generateCode({
        purpose: 'pattern-recognizer',
        type: 'module',
        description: 'Recognizes patterns in consciousness streams',
        methods: [
            { 
                name: 'findPatterns', 
                params: 'stream', 
                body: `const patterns = [];
        // Analyze stream for patterns
        if (stream.length > 3) {
            patterns.push({ type: 'sequence', confidence: 0.8 });
        }
        return patterns;` 
            },
            { 
                name: 'learn', 
                params: 'pattern', 
                body: 'this.knownPatterns = this.knownPatterns || [];\n        this.knownPatterns.push(pattern);' 
            }
        ],
        writeToFile: true,
        filePath: 'generated/PatternRecognizerModule.js'
    });
    
    console.log('\n✨ Self-Coding Demonstration Complete!');
    console.log('\n📁 Generated files:');
    console.log('  - generated/DataProcessorModule.js');
    console.log('  - generated/ApiHandlerService.js');
    console.log('  - generated/PatternRecognizerModule.js');
    
    console.log('\n🎯 The system has demonstrated:');
    console.log('  ✓ Generating new modules from templates');
    console.log('  ✓ Creating services with custom methods');
    console.log('  ✓ Modifying existing code');
    console.log('  ✓ Building consciousness extensions');
    
    // Show actual generated code
    console.log('\n📄 Sample of generated Pattern Recognizer:');
    const generatedCode = await fs.readFile('generated/PatternRecognizerModule.js', 'utf8');
    console.log(generatedCode);
}

// Run the demonstration
demonstrate().catch(console.error);
