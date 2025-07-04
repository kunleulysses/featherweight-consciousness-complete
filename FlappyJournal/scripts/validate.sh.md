# Validation Orchestration Script (validate.sh)

## Overview
The `validate.sh` script performs a comprehensive validation pipeline for candidate deployments of FlappyJournal. It orchestrates the complete testing and validation process before promoting or rolling back deployments.

## Pipeline Steps

1. **Test Environment Setup** (`make test-env-up`)
   - Starts isolated test environment using Docker Compose
   - Waits for services to be ready (API Gateway health check)

2. **Build Candidate Images**
   - Builds main application Docker images
   - Builds k6 test images using `build-docker.sh`

3. **Cypress E2E Tests**
   - Runs comprehensive end-to-end tests using `run-cypress-e2e.sh`
   - Generates JUnit reports, screenshots, and videos
   - Validates core application functionality

4. **k6 Performance Tests**
   - Starts Prometheus/Grafana monitoring stack
   - Runs comprehensive load testing with SLO monitoring
   - Tests WebSocket streaming, auth latency, and database performance

5. **Prometheus Snapshot & SLO Evaluation**
   - Collects metrics from Prometheus
   - Evaluates SLO thresholds:
     - Auth latency P95 < 500ms
     - Upload success rate > 99.5%
     - WebSocket message rate > 100/sec
     - Database pool saturation < 80%
     - No firing alerts
   - Saves snapshot data to JSON

6. **Deployment Decision**
   - **Success**: Calls `promote.sh` to promote deployment
   - **Failure**: Calls `rollback.sh` to rollback deployment

7. **Cleanup** (`make test-env-down`)
   - Stops test environment
   - Stops monitoring services
   - Preserves artifacts for analysis

## Key Features

- **Heredoc Protection**: All heredocs use `cat <<'EOF'` syntax to prevent VPS disconnection issues
- **Comprehensive Logging**: Timestamped, colored output for easy debugging
- **Artifact Collection**: Saves all test results, metrics, and snapshots
- **Automatic Cleanup**: Ensures clean shutdown via trap handlers
- **SLO Monitoring**: Real-time SLO evaluation with configurable thresholds
- **Fail-Fast**: Immediate rollback on any test failure

## Usage

```bash
# Run full validation pipeline
./scripts/validate.sh
```

## Artifacts

All validation artifacts are saved to:
- `./artifacts/cypress/` - E2E test results, videos, screenshots
- `./artifacts/junit/` - JUnit test reports
- `./artifacts/prometheus/` - Prometheus snapshots and SLO evaluations

## Dependencies

- Docker and Docker Compose
- Make
- curl, jq, bc (for metrics evaluation)
- Existing scripts: `run-cypress-e2e.sh`, `promote.sh`, `rollback.sh`
- k6 test infrastructure in `k6-tests/` directory
