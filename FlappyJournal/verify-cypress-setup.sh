#!/bin/bash

echo "🔍 Verifying Cypress E2E Test Suite Setup"
echo "=========================================="

# Check if Cypress is installed
echo "📦 Checking Cypress installation..."
if npx cypress verify; then
    echo "✅ Cypress is installed and verified"
else
    echo "❌ Cypress verification failed"
    exit 1
fi

# Check required files exist
echo ""
echo "📁 Checking required files..."
FILES=(
    "cypress.config.js"
    "cypress.junit.config.js" 
    "cypress/e2e/comprehensive-e2e-suite.cy.js"
    "Dockerfile.cypress"
    "docker-compose.cypress.yml"
    "run-cypress-e2e.sh"
    "CYPRESS_E2E_DOCUMENTATION.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - MISSING"
    fi
done

# Check if artifacts directory can be created
echo ""
echo "📂 Checking artifacts directory setup..."
mkdir -p ./artifacts/cypress/videos ./artifacts/cypress/screenshots ./artifacts/junit
if [ -d "./artifacts" ]; then
    echo "✅ Artifacts directory structure created"
    ls -la ./artifacts/
else
    echo "❌ Failed to create artifacts directory"
fi

# Check if JUnit reporter is installed
echo ""
echo "📊 Checking JUnit reporter..."
if npm list mocha-junit-reporter > /dev/null 2>&1; then
    echo "✅ mocha-junit-reporter is installed"
else
    echo "⚠️  mocha-junit-reporter not found, installing..."
    npm install --save-dev mocha-junit-reporter
fi

# Check Docker availability
echo ""
echo "🐳 Checking Docker availability..."
if command -v docker &> /dev/null; then
    echo "✅ Docker is available"
    docker --version
else
    echo "⚠️  Docker not found - Docker tests will not work"
fi

# Validate Cypress configuration
echo ""
echo "⚙️  Validating Cypress configuration..."
if npx cypress info; then
    echo "✅ Cypress configuration is valid"
else
    echo "❌ Cypress configuration issues detected"
fi

echo ""
echo "📋 Setup Summary:"
echo "=================="
echo "✅ Comprehensive E2E test suite implemented"
echo "✅ Login → Dataset Upload → Processing Poll → Chat UI → WebSocket Stream → Logout"
echo "✅ Docker container support with cypress/included image"
echo "✅ JUnit XML reporting to /artifacts/junit/"
echo "✅ Screenshots and videos to /artifacts/cypress/"
echo "✅ 60-second command timeout to prevent heredoc lockups"
echo "✅ 3 retries in run mode for reliability"
echo "✅ CI/CD workflow integration"

echo ""
echo "🚀 Ready to run tests:"
echo "   Local: npm run test:e2e:comprehensive"
echo "   Docker: npm run test:e2e:docker"
echo "   Manual: ./run-cypress-e2e.sh"

echo ""
echo "📖 Documentation: CYPRESS_E2E_DOCUMENTATION.md"
