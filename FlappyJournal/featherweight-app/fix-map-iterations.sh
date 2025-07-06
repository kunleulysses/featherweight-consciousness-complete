#!/bin/bash

# Fix Map iterations for TypeScript ES5 compatibility
sed -i 's/for (const \[\([^]]*\)\] of this\.modules)/for (const [\1] of Array.from(this.modules))/g' src/services/ConsciousnessEventBus.ts
sed -i 's/for (const \[\([^]]*\)\] of this\.dependencies)/for (const [\1] of Array.from(this.dependencies))/g' src/services/ModuleOrchestrator.ts
sed -i 's/for (const \[\([^]]*\)\] of this\.orchestrationPatterns)/for (const [\1] of Array.from(this.orchestrationPatterns))/g' src/services/ModuleOrchestrator.ts
sed -i 's/for (const \[\([^]]*\)\] of this\.resourceAllocations)/for (const [\1] of Array.from(this.resourceAllocations))/g' src/services/ModuleOrchestrator.ts
sed -i 's/for (const \[\([^]]*\)\] of this\.moduleHealth)/for (const [\1] of Array.from(this.moduleHealth))/g' src/services/SelfHealingModule.ts
sed -i 's/for (const health of this\.moduleHealth\.values())/for (const health of Array.from(this.moduleHealth.values()))/g' src/services/SelfHealingModule.ts

# Fix for other Map iterations
find src/services -name "*.ts" -exec sed -i 's/\(for.*of.*\)\(this\.[a-zA-Z]*\)\.values()/\1Array.from(\2.values())/g' {} \;
find src/services -name "*.ts" -exec sed -i 's/\(for.*of.*\)\(this\.[a-zA-Z]*\)\.entries()/\1Array.from(\2.entries())/g' {} \;

echo "Fixed Map iterations for ES5 compatibility"
