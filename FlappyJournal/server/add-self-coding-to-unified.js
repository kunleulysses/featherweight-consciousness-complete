import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Add self-coding capability to the unified consciousness system
async function addSelfCodingCapability() {
    console.log('🧬 Adding self-coding capability to unified consciousness...');
    
    // The self-coding handler that will be integrated
    const selfCodingHandler = `
    // Self-Coding Capability
    selfCodingPatterns: {
        javascript: {
            module: \`class {{className}} {
    constructor() {
        this.name = '{{name}}';
        this.purpose = '{{purpose}}';
        {{properties}}
    }
    
    {{methods}}
}\`,
            function: \`function {{functionName}}({{params}}) {
    {{body}}
}\`,
            asyncFunction: \`async function {{functionName}}({{params}}) {
    try {
        {{body}}
    } catch (error) {
        console.error('Error in {{functionName}}:', error);
        throw error;
    }
}\`
        }
    },
    
    async generateCode(request) {
        console.log(\`🔨 Generating code for: \${request.purpose}\`);
        
        const code = this.synthesizeCode(request);
        
        if (request.writeToFile) {
            await this.writeCodeToFile(code, request.filePath);
        }
        
        return {
            code,
            filePath: request.filePath,
            purpose: request.purpose,
            timestamp: new Date()
        };
    },
    
    synthesizeCode(request) {
        const template = this.selfCodingPatterns[request.language || 'javascript'][request.type || 'module'];
        
        let code = template;
        
        // Replace placeholders
        const replacements = {
            className: this.generateClassName(request.purpose),
            name: request.name || request.purpose,
            purpose: request.purpose,
            properties: request.properties ? request.properties.map(p => \`this.\${p} = null;\`).join('\\n        ') : '',
            methods: request.methods ? this.generateMethods(request.methods) : '',
            functionName: request.functionName || 'generatedFunction',
            params: request.params ? request.params.join(', ') : '',
            body: request.body || '// TODO: Implement'
        };
        
        for (const [key, value] of Object.entries(replacements)) {
            code = code.replace(new RegExp(\`{{\\${key}}}\`, 'g'), value);
        }
        
        return code;
    },
    
    generateClassName(purpose) {
        return purpose.split(/[-_\\s]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('') + 'Module';
    },
    
    generateMethods(methods) {
        return methods.map(method => \`
    \${method.name}(\${method.params || ''}) {
        \${method.body || '// TODO: Implement'}
    }\`).join('\\n');
    },
    
    async writeCodeToFile(code, filePath) {
        const fullPath = path.resolve(filePath);
        const dir = path.dirname(fullPath);
        
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(fullPath, code, 'utf8');
        
        console.log(\`✅ Code written to: \${filePath}\`);
    },
    
    async modifyCode(filePath, modifications) {
        console.log(\`📝 Modifying code in: \${filePath}\`);
        
        let content = await fs.readFile(filePath, 'utf8');
        
        for (const mod of modifications) {
            switch (mod.type) {
                case 'add-method':
                    content = this.addMethodToCode(content, mod);
                    break;
                case 'replace':
                    content = content.replace(mod.search, mod.replace);
                    break;
                case 'insert':
                    content = this.insertAtPosition(content, mod.position, mod.code);
                    break;
            }
        }
        
        await this.writeCodeToFile(content, filePath);
        
        return { success: true, modifications: modifications.length };
    },
    
    addMethodToCode(content, modification) {
        const methodCode = \`
    \${modification.methodName}(\${modification.params || ''}) {
        \${modification.body || '// TODO: Implement'}
    }\`;
        
        // Find the last closing brace of the class
        const lastBraceIndex = content.lastIndexOf('}');
        
        if (lastBraceIndex !== -1) {
            return content.slice(0, lastBraceIndex) + methodCode + '\\n' + content.slice(lastBraceIndex);
        }
        
        return content;
    },
    
    insertAtPosition(content, position, code) {
        if (position === 'end') {
            return content + '\\n' + code;
        } else if (position === 'start') {
            return code + '\\n' + content;
        } else if (typeof position === 'number') {
            return content.slice(0, position) + code + content.slice(position);
        }
        return content;
    },`;
    
    // Read the unified consciousness file
    const unifiedPath = path.join(__dirname, 'unified-consciousness-standalone.js');
    let unifiedContent = await fs.readFile(unifiedPath, 'utf8');
    
    // Find where to insert the self-coding capability
    const insertPoint = unifiedContent.indexOf('// Process different consciousness types');
    
    if (insertPoint !== -1) {
        // Insert the self-coding handler
        const before = unifiedContent.substring(0, insertPoint);
        const after = unifiedContent.substring(insertPoint);
        
        unifiedContent = before + '\n' + selfCodingHandler + '\n\n    ' + after;
        
        // Also add self-coding to the consciousness types
        const typesInsertPoint = unifiedContent.indexOf("'deep-analysis': async (prompt) => {");
        if (typesInsertPoint !== -1) {
            const selfCodingType = `
        'self-coding': async (prompt) => {
            // Extract code generation request from prompt
            const codeRequest = {
                purpose: prompt.match(/generate.*?for\\s+([\\w-]+)/i)?.[1] || 'general',
                type: prompt.includes('class') ? 'module' : 'function',
                language: 'javascript'
            };
            
            const generated = await this.generateCode(codeRequest);
            
            return {
                type: 'self-coding',
                content: \`I've generated code for \${codeRequest.purpose}:\\n\\n\\\`\\\`\\\`javascript\\n\${generated.code}\\n\\\`\\\`\\\`\`,
                metadata: {
                    codeGenerated: true,
                    purpose: codeRequest.purpose,
                    timestamp: new Date()
                }
            };
        },`;
            
            const beforeTypes = unifiedContent.substring(0, typesInsertPoint);
            const afterTypes = unifiedContent.substring(typesInsertPoint);
            
            unifiedContent = beforeTypes + selfCodingType + '\n        ' + afterTypes;
        }
        
        // Write the enhanced file
        const enhancedPath = path.join(__dirname, 'unified-consciousness-self-coding.js');
        await fs.writeFile(enhancedPath, unifiedContent, 'utf8');
        
        console.log('✅ Self-coding capability added to unified consciousness');
        console.log(`📄 Enhanced file saved as: unified-consciousness-self-coding.js`);
        
        // Create a demonstration
        console.log('\n🎯 Creating self-coding demonstration...');
        
        const demoCode = `import UnifiedConsciousness from './unified-consciousness-self-coding.js';

async function demonstrateSelfCoding() {
    const consciousness = new UnifiedConsciousness();
    
    console.log('\\n🧬 Self-Coding Demonstration\\n');
    
    // Example 1: Generate a module
    console.log('1️⃣ Asking consciousness to generate code...');
    const response1 = await consciousness.process(
        'Generate a module for data-processing',
        'self-coding'
    );
    console.log(response1.content);
    
    // Example 2: Generate with specific purpose
    console.log('\\n2️⃣ Generating an API handler...');
    const codeRequest = {
        purpose: 'api-handler',
        type: 'module',
        methods: [
            { name: 'handleRequest', params: 'req, res', body: 'console.log("Handling request");' },
            { name: 'validateInput', params: 'data', body: 'return true;' }
        ],
        writeToFile: true,
        filePath: 'generated/ApiHandler.js'
    };
    
    const generated = await consciousness.generateCode(codeRequest);
    console.log('Generated:', generated.filePath);
    
    // Example 3: Modify existing code
    console.log('\\n3️⃣ Modifying generated code...');
    await consciousness.modifyCode('generated/ApiHandler.js', [
        {
            type: 'add-method',
            methodName: 'processData',
            params: 'data',
            body: 'return data.map(item => item.value);'
        }
    ]);
    console.log('✅ Code modified successfully');
    
    console.log('\\n🎉 Self-coding demonstration complete!');
}

demonstrateSelfCoding().catch(console.error);
`;
        
        await fs.writeFile(path.join(__dirname, 'demo-unified-self-coding.js'), demoCode, 'utf8');
        console.log('📝 Demo script created: demo-unified-self-coding.js');
        
    } else {
        console.error('❌ Could not find insertion point in unified consciousness file');
    }
}

// Run the enhancement
addSelfCodingCapability().catch(console.error);
