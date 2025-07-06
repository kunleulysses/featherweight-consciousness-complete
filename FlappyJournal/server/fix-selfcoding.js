import { promises as fs } from 'fs';

async function fix() {
    let content = await fs.readFile('./consciousness/modules/SelfCodingModule.js', 'utf8');
    
    // Find the validateCode method and fix it
    const badSection = `// File doesn't exist, no backup needed
        }
        
        // Write the new code
            // ES module validation - just return valid
            return { valid: true };
            try {
                await execPromise(\`node -c "\${fullPath}"\`);
                console.log('✅ Syntax check passed');
            } catch (error) {
                console.error('⚠️ Syntax check failed:', error.message);
            }
        }
    }`;
    
    const goodSection = `// File doesn't exist, no backup needed
        }
        
        // Write the new code
        await fs.writeFile(fullPath, code, 'utf8');
        console.log(\`✅ Code written to: \${fullPath}\`);
        
        // If it's a JS file, check if it's syntactically valid
        if (filePath.endsWith('.js')) {
            try {
                await execPromise(\`node -c "\${fullPath}"\`);
                console.log('✅ Syntax check passed');
            } catch (error) {
                console.error('⚠️ Syntax check failed:', error.message);
            }
        }
    }`;
    
    content = content.replace(badSection, goodSection);
    
    await fs.writeFile('./consciousness/modules/SelfCodingModule.js', content);
    console.log('Fixed SelfCodingModule');
}

fix().catch(console.error);
