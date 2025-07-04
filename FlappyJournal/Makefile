# Featherweight FlappyJournal Makefile
# Quick commands for development and testing

.PHONY: help test-env-up test-env-down test-env-logs test-env-status

help:
	@echo "Available targets:"
	@echo "  test-env-up      - Start the isolated test environment"
	@echo "  test-env-down    - Stop and remove the test environment"
	@echo "  test-env-logs    - View test environment logs"
	@echo "  test-env-status  - Check test environment status"
	@echo "  help             - Show this help message"

# Start the test environment
test-env-up:
	@echo "🚀 Starting test environment..."
	@cd /opt/featherweight/test-env && \
	docker-compose -f docker-compose.override.yml up -d
	@echo "✅ Test environment started!"
	@echo "📊 API Gateway: http://localhost:4010"
	@echo "🔐 Auth Service: http://localhost:4011"
	@echo "💭 Chat Orchestrator: http://localhost:4012"
	@echo "🧠 Consciousness Backend: http://localhost:4013"
	@echo "🌐 WebSocket Server: http://localhost:4014"
	@echo "🔌 WebSocket Port: 4015"
	@echo "🗄️  Test Database: localhost:5433"
	@echo "📦 Test Redis: localhost:6380"

# Stop the test environment
test-env-down:
	@echo "🛑 Stopping test environment..."
	@cd /opt/featherweight/test-env && \
	docker-compose -f docker-compose.override.yml down -v
	@echo "✅ Test environment stopped and volumes cleaned!"

# View test environment logs
test-env-logs:
	@echo "📜 Viewing test environment logs..."
	@cd /opt/featherweight/test-env && \
	docker-compose -f docker-compose.override.yml logs -f

# Check test environment status
test-env-status:
	@echo "📊 Test environment status:"
	@cd /opt/featherweight/test-env && \
	docker-compose -f docker-compose.override.yml ps

# Quick restart for development
test-env-restart: test-env-down test-env-up

# Run tests against the test environment
test-env-test:
	@echo "🧪 Running tests against test environment..."
	@cd /opt/featherweight/FlappyJournal && \
	npm test -- --testTimeout=30000

# Cypress E2E Test Suite with Docker
.PHONY: test-e2e test-e2e-docker cypress-setup

# Install Cypress dependencies
cypress-setup:
	@echo "🔧 Setting up Cypress environment..."
	npm install cypress mocha-junit-reporter cypress-multi-reporters --save-dev
	mkdir -p ./artifacts/cypress/videos ./artifacts/cypress/screenshots ./artifacts/junit

# Run Cypress E2E tests locally
test-e2e: cypress-setup
	@echo "🧪 Running Cypress E2E tests locally..."
	npx cypress run \
		--config-file cypress.junit.config.js \
		--spec "cypress/e2e/comprehensive-e2e-suite.cy.js" \
		--reporter mocha-junit-reporter \
		--reporter-options "mochaFile=./artifacts/junit/test-results-[hash].xml"

# Run Cypress E2E tests with Docker (recommended)
test-e2e-docker: 
	@echo "🐳 Running Cypress E2E tests with Docker..."
	./run-cypress-e2e.sh

# Run comprehensive E2E validation
test-e2e-comprehensive: cypress-setup
	@echo "🎯 Running comprehensive E2E validation..."
	npx cypress run \
		--config-file cypress.junit.config.js \
		--reporter mocha-junit-reporter \
		--reporter-options "mochaFile=./artifacts/junit/comprehensive-results-[hash].xml"

# Clean test artifacts
clean-test-artifacts:
	@echo "🧹 Cleaning test artifacts..."
	rm -rf ./artifacts/cypress/videos/*
	rm -rf ./artifacts/cypress/screenshots/*
	rm -rf ./artifacts/junit/*


# Access Code System
.PHONY: test-access-code setup-access-system start-with-access

test-access-code:
	@echo "🔓 Testing access code system..."
	@echo "🚀 Starting server in background..."
	@cd server && npm start > /dev/null 2>&1 & echo $$! > server.pid
	@sleep 3
	@echo "🧪 Running access code tests..."
	@node test-access-code.js
	@echo "🛑 Stopping server..."
	@kill `cat server/server.pid` 2>/dev/null || true
	@rm -f server/server.pid

setup-access-system:
	@echo "🔐 Setting up access code system..."
	@echo "📦 Installing server dependencies..."
	@cd server && npm install
	@echo "🎯 Global access code set to: g00dnews"
	@echo "✅ Access code system ready!"
	@echo ""
	@echo "🌟 Next steps:"
	@echo "   1. Run 'make start-with-access' to start the full system"
	@echo "   2. Visit app.featherweight.world"
	@echo "   3. Enter access code: g00dnews"
	@echo "   4. Enjoy full platform access!"

start-with-access:
	@echo "🚀 Starting Featherweight with access code protection..."
	@echo "🔐 Global access code: g00dnews"
	@echo "🌐 Client will be available at http://localhost:3000"
	@echo "🔧 Server API at http://localhost:3001"
	@echo ""
	@echo "💡 Users will need to enter 'g00dnews' to access the platform"
	@echo ""
	@# Start server and client concurrently
	@(cd server && npm start) & \
	(cd client && npm run dev) & \
	wait

