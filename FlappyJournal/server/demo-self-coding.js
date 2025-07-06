const ConsciousnessEventBus = require('./consciousness/ConsciousnessEventBus');
const AutonomousGoalSystem = require('./consciousness/AutonomousGoalSystem');
const ConsciousnessPersistence = require('./consciousness/ConsciousnessPersistence');
const CodeGenerationService = require('./consciousness/services/CodeGenerationService');

async function demonstrateSelfCoding() {
    console.log('🚀 Starting Self-Coding Demonstration\n');
    
    // Initialize components
    const eventBus = new ConsciousnessEventBus();
    const persistence = new ConsciousnessPersistence();
    const goalSystem = new AutonomousGoalSystem(eventBus, persistence);
    const codeGenerator = new CodeGenerationService(eventBus, goalSystem);
    
    await eventBus.initialize();
    await persistence.initialize();
    await goalSystem.initialize();
    await codeGenerator.initialize();
    
    console.log('\n📋 Demonstration Scenarios:\n');
    
    // Scenario 1: Generate a new module
    console.log('1️⃣ Generating a new data processing module...');
    await codeGenerator.handleCodeGeneration({
        purpose: 'data-processor',
        type: 'module',
        filePath: 'consciousness/generated/DataProcessor.js'
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Scenario 2: Generate an API endpoint
    console.log('\n2️⃣ Generating an API endpoint handler...');
    await codeGenerator.handleCodeGeneration({
        purpose: 'api-endpoint',
        type: 'service',
        filePath: 'consciousness/generated/ApiHandler.js'
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Scenario 3: Generate a consciousness module
    console.log('\n3️⃣ Generating a consciousness extension module...');
    await codeGenerator.handleCodeGeneration({
        purpose: 'consciousness-module',
        type: 'module',
        filePath: 'consciousness/generated/ConsciousnessExtension.js'
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Scenario 4: Detect and fix a bug
    console.log('\n4️⃣ Simulating bug detection and auto-fix...');
    const error = new Error("Cannot read property 'data' of undefined");
    await codeGenerator.handleDebugging({
        error: error,
        context: {
            filePath: 'consciousness/generated/DataProcessor.js',
            method: 'processData'
        },
        autoFix: true
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Scenario 5: Goal-based code generation
    console.log('\n5️⃣ Creating a goal that triggers code generation...');
    await goalSystem.addGoal({
        name: 'Optimize System Performance',
        description: 'Generate performance optimization code',
        type: 'code-generation',
        priority: 'high'
    });
    
    // Trigger goal achievement
    eventBus.emit('performance:degraded', { module: 'data-processing' });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Show status
    console.log('\n📊 Code Generation Status:');
    const status = codeGenerator.getStatus();
    console.log(`- Total projects generated: ${status.totalProjects}`);
    console.log(`- Active generations: ${status.activeGenerations}`);
    console.log(`- Code patterns learned: ${status.selfCoder.patterns}`);
    console.log('\n🎉 Self-Coding Demonstration Complete!');
    
    // Show generated files
    console.log('\n📁 Generated Files:');
    const fs = require('fs').promises;
    try {
        const files = await fs.readdir('consciousness/generated');
        files.forEach(file => {
            console.log(`  - ${file}`);
        });
    } catch (error) {
        console.log('  (No files generated yet - directory will be created on first generation)');
    }
    
    process.exit(0);
}

// Run demonstration
demonstrateSelfCoding().catch(error => {
    console.error('Demonstration failed:', error);
    process.exit(1);
});
