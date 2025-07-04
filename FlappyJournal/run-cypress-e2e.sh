#!/bin/bash

# Cypress E2E Test Runner with Docker
# This script runs the comprehensive e2e test suite using cypress-docker container
# with JUnit output, screenshots, retries, and 60s command timeout

set -e

echo "🚀 Starting Cypress E2E Test Suite"
echo "======================================"

# Create artifacts directory
echo "📁 Creating artifacts directory..."
mkdir -p ./artifacts/cypress/videos
mkdir -p ./artifacts/cypress/screenshots
mkdir -p ./artifacts/junit

# Check if services are running
echo "🔍 Checking if services are running..."
if ! curl -f http://localhost:4000/health 2>/dev/null && ! curl -f http://localhost:4000 2>/dev/null; then
    echo "⚠️  Warning: Services may not be running on localhost:4000"
    echo "   Please ensure your application is running before executing tests"
fi

# Install Cypress JUnit reporter if not already installed
echo "📦 Installing JUnit reporter..."
npm install --save-dev mocha-junit-reporter cypress-multi-reporters || true

# Run Cypress tests with Docker
echo "🐳 Running Cypress tests in Docker container..."
echo "   - JUnit reports will be saved to: ./artifacts/junit/"
echo "   - Screenshots will be saved to: ./artifacts/cypress/screenshots/"
echo "   - Videos will be saved to: ./artifacts/cypress/videos/"
echo "   - Command timeout: 60 seconds"
echo "   - Retries enabled: 3 attempts in run mode"
echo ""

# Use cypress-docker image directly
docker run --rm \
  --network host \
  -v "$(pwd):/e2e" \
  -v "$(pwd)/artifacts:/artifacts" \
  -w /e2e \
  -e CYPRESS_baseUrl=http://localhost:4000 \
  -e CYPRESS_video=true \
  -e CYPRESS_videoCompression=32 \
  -e CYPRESS_videosFolder=/artifacts/cypress/videos \
  -e CYPRESS_screenshotsFolder=/artifacts/cypress/screenshots \
  -e CYPRESS_defaultCommandTimeout=60000 \
  -e CYPRESS_requestTimeout=60000 \
  -e CYPRESS_responseTimeout=60000 \
  -e CYPRESS_pageLoadTimeout=60000 \
  -e CYPRESS_retries_runMode=3 \
  -e CYPRESS_retries_openMode=1 \
  cypress/included:latest \
  bash -c "
    echo 'Installing JUnit reporter...' &&
    npm install mocha-junit-reporter cypress-multi-reporters &&
    echo 'Running Cypress tests...' &&
    npx cypress run \
      --reporter mocha-junit-reporter \
      --reporter-options 'mochaFile=/artifacts/junit/test-results-[hash].xml' \
      --config video=true,videosFolder=/artifacts/cypress/videos,screenshotsFolder=/artifacts/cypress/screenshots,defaultCommandTimeout=60000,requestTimeout=60000,responseTimeout=60000,pageLoadTimeout=60000,retries.runMode=3,retries.openMode=1 \
      --spec 'cypress/e2e/comprehensive-e2e-suite.cy.js' \
      --headless
  "

EXIT_CODE=$?

echo ""
echo "📊 Test Results Summary:"
echo "========================"

# Count test results
if [ -d "./artifacts/junit" ]; then
    JUNIT_FILES=$(find ./artifacts/junit -name "*.xml" | wc -l)
    echo "📋 JUnit report files generated: $JUNIT_FILES"
fi

if [ -d "./artifacts/cypress/videos" ]; then
    VIDEO_FILES=$(find ./artifacts/cypress/videos -name "*.mp4" | wc -l)
    echo "🎥 Video recordings: $VIDEO_FILES"
fi

if [ -d "./artifacts/cypress/screenshots" ]; then
    SCREENSHOT_FILES=$(find ./artifacts/cypress/screenshots -name "*.png" | wc -l)
    echo "📸 Screenshots captured: $SCREENSHOT_FILES"
fi

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Cypress E2E tests completed successfully!"
    echo "   All artifacts are available in ./artifacts/"
else
    echo "❌ Cypress E2E tests failed (exit code: $EXIT_CODE)"
    echo "   Check artifacts for failure details"
fi

echo ""
echo "📁 Artifacts location:"
echo "   JUnit reports: ./artifacts/junit/"
echo "   Videos: ./artifacts/cypress/videos/"
echo "   Screenshots: ./artifacts/cypress/screenshots/"

exit $EXIT_CODE
