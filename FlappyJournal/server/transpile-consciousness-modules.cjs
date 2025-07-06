const fs = require('fs');
const path = require('path');

// For now, we'll create JavaScript versions of the key modules
// In production, you'd use proper TypeScript compilation

console.log('📝 Creating JavaScript versions of consciousness modules...');

// List of modules to convert
const modules = [
  'ConsciousnessEventBus',
  'SelfHealingModule', 
  'ModuleOrchestrator',
  'ConsciousnessPersistence',
  'AutonomousGoalSystem',
  'SelfCodingEngine'
];

// Basic TypeScript to JavaScript conversion (simplified)
function convertTypeScriptToJavaScript(content) {
  // Remove TypeScript-specific syntax
  let jsContent = content
    // Remove type annotations
    .replace(/:\s*\w+(\[\])?/g, '')
    .replace(/:\s*{[^}]+}/g, '')
    .replace(/:\s*\([^)]+\)\s*=>/g, '')
    // Remove interface definitions
    .replace(/export\s+interface\s+\w+\s*{[^}]+}/gs, '')
    .replace(/interface\s+\w+\s*{[^}]+}/gs, '')
    // Remove type exports
    .replace(/export\s+type\s+[^;]+;/g, '')
    // Remove generic type parameters
    .replace(/<[^>]+>/g, '')
    // Convert public/private/protected to nothing
    .replace(/\b(public|private|protected)\s+/g, '')
    // Remove readonly
    .replace(/\breadonly\s+/g, '')
    // Convert import statements
    .replace(/import\s+{([^}]+)}\s+from\s+'([^']+)'/g, "const {$1} = require('$2')")
    .replace(/import\s+(\w+)\s+from\s+'([^']+)'/g, "const $1 = require('$2')")
    // Fix class property declarations
    .replace(/^(\s*)(\w+)\s*=\s*/gm, '$1this.$2 = ')
    // Remove 'as' type assertions
    .replace(/\s+as\s+\w+/g, '')
    // Fix for...of loops
    .replace(/for\s*\(\s*const\s*\[([^]]+)\]\s*of\s*Array\.from\(([^)]+)\)\)/g, 'for (const [$1] of Array.from($2))')
    // Export statements
    .replace(/export\s+const\s+/g, 'module.exports.')
    .replace(/export\s+class\s+/g, 'class ')
    .replace(/export\s+{([^}]+)}/g, 'module.exports = {$1}');

  // Add module.exports for classes
  const classMatch = jsContent.match(/class\s+(\w+)/);
  if (classMatch) {
    const className = classMatch[1];
    if (!jsContent.includes(`module.exports.${className}`)) {
      jsContent += `\n\nmodule.exports.${className} = ${className};`;
    }
  }

  return jsContent;
}

// Process each module
modules.forEach(moduleName => {
  const tsFile = path.join(__dirname, `${moduleName}.ts`);
  const jsFile = path.join(__dirname, `${moduleName}.js`);
  
  if (fs.existsSync(tsFile)) {
    console.log(`Converting ${moduleName}.ts to .js...`);
    const tsContent = fs.readFileSync(tsFile, 'utf8');
    const jsContent = convertTypeScriptToJavaScript(tsContent);
    fs.writeFileSync(jsFile, jsContent);
    console.log(`✅ Created ${moduleName}.js`);
  } else {
    console.log(`⚠️  ${moduleName}.ts not found`);
  }
});

console.log('\n✅ Module conversion complete!');
