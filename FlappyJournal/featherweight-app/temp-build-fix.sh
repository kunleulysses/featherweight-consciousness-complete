#!/bin/bash

# Temporarily comment out service dependencies to get the dashboard deployed

# Move the complex services to a temp directory
mkdir -p src/services/temp
mv src/services/ConsciousnessEventBus.ts src/services/temp/
mv src/services/SelfHealingModule.ts src/services/temp/
mv src/services/ModuleOrchestrator.ts src/services/temp/
mv src/services/ConsciousnessPersistence.ts src/services/temp/
mv src/services/ConsciousnessPersistenceLayer.ts src/services/temp/
mv src/services/AutonomousGoalSystem.ts src/services/temp/
mv src/services/SelfCodingEngine.ts src/services/temp/

echo "Moved services to temp directory for build"
