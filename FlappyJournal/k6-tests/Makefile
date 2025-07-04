# Makefile for k6 test suite
# Provides local CI pipeline functionality

.PHONY: ci help clean test build docker-build docker-up docker-down setup validate

# Default target
help:
	@echo "Available targets:"
	@echo "  ci              - Run the complete CI pipeline (validation)"
	@echo "  validate        - Run validation checks"
	@echo "  test            - Run k6 tests"
	@echo "  build           - Build Docker image"
	@echo "  docker-build    - Build Docker image for k6 tests"
	@echo "  docker-up       - Start monitoring stack with docker-compose"
	@echo "  docker-down     - Stop monitoring stack"
	@echo "  setup           - Initial setup for test environment"
	@echo "  clean           - Clean up temporary files"
	@echo "  help            - Show this help message"

# CI target - main entry point for continuous integration
ci: validate
	@echo "✅ CI pipeline completed successfully!"

# Validate project structure and configurations
validate:
	@echo "🔍 Running validation pipeline..."
	@chmod +x scripts/validate.sh
	@./scripts/validate.sh

# Run k6 tests
test:
	@echo "🧪 Running k6 tests..."
	@if command -v k6 >/dev/null 2>&1; then \
		k6 run load-test.js; \
	else \
		echo "❌ k6 is not installed. Please install k6 first."; \
		exit 1; \
	fi

# Build Docker image
build: docker-build

# Build Docker image for k6 tests
docker-build:
	@echo "🐳 Building Docker image..."
	@if [ -f "build-docker.sh" ]; then \
		chmod +x build-docker.sh; \
		./build-docker.sh; \
	else \
		docker build -t k6-tests .; \
	fi

# Start monitoring stack
docker-up:
	@echo "🚀 Starting monitoring stack..."
	@docker-compose up -d

# Stop monitoring stack
docker-down:
	@echo "🛑 Stopping monitoring stack..."
	@docker-compose down

# Setup test environment
setup:
	@echo "⚙️  Setting up test environment..."
	@if [ -f "test-setup.sh" ]; then \
		chmod +x test-setup.sh; \
		./test-setup.sh; \
	else \
		echo "test-setup.sh not found, skipping setup"; \
	fi

# Clean up temporary files
clean:
	@echo "🧹 Cleaning up temporary files..."
	@rm -f *.log
	@rm -rf tmp/
	@docker system prune -f 2>/dev/null || true
	@echo "Clean up completed"

# Run SLO testing
slo-test:
	@echo "📊 Running SLO testing..."
	@if [ -f "run-slo-testing.sh" ]; then \
		chmod +x run-slo-testing.sh; \
		./run-slo-testing.sh; \
	else \
		echo "run-slo-testing.sh not found"; \
		exit 1; \
	fi

# Validate SLO setup
slo-validate:
	@echo "🔍 Validating SLO setup..."
	@if [ -f "validate-slo-setup.sh" ]; then \
		chmod +x validate-slo-setup.sh; \
		./validate-slo-setup.sh; \
	else \
		echo "validate-slo-setup.sh not found"; \
		exit 1; \
	fi

# Research Platform Load Testing
.PHONY: research-load-test research-build research-validate

research-build:
	@echo "🔬 Building research platform k6 image..."
	docker build -f Dockerfile.research-k6 -t fw-k6:research .

research-load-test: research-build
	@echo "🧠 Starting research platform load test..."
	@echo "📊 Testing full consciousness technology for research validation..."
	docker run --rm \
		--network host \
		-v $(PWD)/artifacts:/artifacts \
		-e BASE_URL=http://localhost:4000 \
		-e CONSCIOUSNESS_API=http://localhost:4003 \
		-e CHAT_ORCHESTRATOR=http://localhost:4002 \
		-e RESEARCH_API=http://localhost:4004 \
		-e WS_URL=ws://localhost:4002 \
		-e K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write \
		fw-k6:research

research-validate: research-load-test
	@echo "📑 Generating research validation report..."
	@if [ -f artifacts/research-reports/research-validation-summary.json ]; then \
		echo "✅ Research validation complete. Summary available at:"; \
		echo "   📄 artifacts/research-reports/research-validation-summary.json"; \
		echo "   📊 Consciousness metrics in artifacts/consciousness-metrics/"; \
		echo "   📝 Validation logs in artifacts/validation-logs/"; \
		echo ""; \
		echo "🏆 Platform ready for:"; \
		echo "   • Research journal publication"; \
		echo "   • Academic validation"; \
		echo "   • Consciousness technology demonstration"; \
		echo "   • Invited researcher testing"; \
	else \
		echo "❌ Research validation failed - check logs"; \
		exit 1; \
	fi

# Extended research testing with soak test
research-soak-test:
	@echo "🔬 Starting extended research platform soak test (2 hours)..."
	docker run --rm \
		--network host \
		-v $(PWD)/artifacts:/artifacts \
		-e BASE_URL=http://localhost:4000 \
		-e CONSCIOUSNESS_API=http://localhost:4003 \
		-e RESEARCH_API=http://localhost:4004 \
		-e K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write \
		fw-k6:research \
		k6 run --duration=2h --vus=5 research-platform-load-test.js

# Quick research smoke test
research-smoke-test:
	@echo "💨 Running quick research platform smoke test..."
	docker run --rm \
		--network host \
		-v $(PWD)/artifacts:/artifacts \
		-e BASE_URL=http://localhost:4000 \
		-e CONSCIOUSNESS_API=http://localhost:4003 \
		fw-k6:research \
		k6 run --duration=2m --vus=3 research-platform-load-test.js

