#!/bin/bash

# Validation Orchestration Script for FlappyJournal
# This script performs the complete validation pipeline for candidate deployments

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
K6_TESTS_DIR="$PROJECT_DIR/k6-tests"
ARTIFACTS_DIR="$PROJECT_DIR/artifacts"
PROMETHEUS_SNAPSHOT_DIR="$ARTIFACTS_DIR/prometheus"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Cleanup function
cleanup() {
    local exit_code=$?
    log "🧹 Cleaning up..."
    
    # Stop test environment
    cd "$PROJECT_DIR"
    if make test-env-down > /dev/null 2>&1; then
        log "✅ Test environment stopped"
    else
        warning "Failed to stop test environment"
    fi
    
    # Stop monitoring services
    cd "$K6_TESTS_DIR"
    if ./run-slo-testing.sh stop-monitoring > /dev/null 2>&1; then
        log "✅ Monitoring services stopped"
    else
        warning "Failed to stop monitoring services"
    fi
    
    exit $exit_code
}

# Set up cleanup trap
trap cleanup EXIT

# Function to check if a service is responding
check_service() {
    local url="$1"
    local service_name="$2"
    local max_attempts=30
    local attempt=1
    
    log "🔍 Checking $service_name at $url..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            success "$service_name is responding"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            error "$service_name is not responding after $max_attempts attempts"
            return 1
        fi
        
        log "⏳ Attempt $attempt/$max_attempts: $service_name not ready, waiting..."
        sleep 5
        ((attempt++))
    done
}

# Function to build candidate images
build_candidate_images() {
    log "🏗️  Building candidate images..."
    
    cd "$PROJECT_DIR"
    
    # Build main application images
    if docker-compose build > /dev/null 2>&1; then
        success "Main application images built successfully"
    else
        error "Failed to build main application images"
        return 1
    fi
    
    # Build k6 test images
    cd "$K6_TESTS_DIR"
    if ./build-docker.sh > /dev/null 2>&1; then
        success "k6 test images built successfully"
    else
        error "Failed to build k6 test images"
        return 1
    fi
    
    return 0
}

# Function to run Cypress E2E tests
run_cypress_tests() {
    log "🧪 Running Cypress E2E tests..."
    
    cd "$PROJECT_DIR"
    
    # Create artifacts directory
    mkdir -p "$ARTIFACTS_DIR/cypress/videos"
    mkdir -p "$ARTIFACTS_DIR/cypress/screenshots"
    mkdir -p "$ARTIFACTS_DIR/junit"
    
    # Run Cypress tests
    if ./run-cypress-e2e.sh; then
        success "Cypress E2E tests passed"
        
        # Display test summary
        if [ -d "$ARTIFACTS_DIR/junit" ]; then
            local junit_files=$(find "$ARTIFACTS_DIR/junit" -name "*.xml" | wc -l)
            log "📋 JUnit reports generated: $junit_files"
        fi
        
        return 0
    else
        error "Cypress E2E tests failed"
        return 1
    fi
}

# Function to run k6 performance tests
run_k6_tests() {
    log "🚀 Running k6 performance tests..."
    
    cd "$K6_TESTS_DIR"
    
    # Start monitoring services
    if ./run-slo-testing.sh start-monitoring; then
        success "Monitoring services started"
    else
        error "Failed to start monitoring services"
        return 1
    fi
    
    # Wait for monitoring to be ready
    sleep 10
    
    # Check if Prometheus is ready
    if ! check_service "http://localhost:9090/-/ready" "Prometheus"; then
        error "Prometheus is not ready"
        return 1
    fi
    
    # Run comprehensive load test
    log "🔥 Running comprehensive load test..."
    if ./run-slo-testing.sh run-comprehensive; then
        success "k6 comprehensive tests passed"
    else
        error "k6 comprehensive tests failed"
        return 1
    fi
    
    return 0
}

# Function to collect Prometheus snapshot and evaluate thresholds
collect_prometheus_snapshot() {
    log "📊 Collecting Prometheus snapshot and evaluating thresholds..."
    
    # Create snapshot directory
    mkdir -p "$PROMETHEUS_SNAPSHOT_DIR"
    
    # Define SLO thresholds
    local AUTH_LATENCY_P95_THRESHOLD=500  # milliseconds
    local UPLOAD_SUCCESS_RATE_THRESHOLD=99.5  # percentage
    local WEBSOCKET_MSG_RATE_THRESHOLD=100  # messages per second
    local DB_POOL_SATURATION_THRESHOLD=80  # percentage
    
    # Collect metrics snapshot
    log "📈 Collecting metrics from Prometheus..."
    
    # Create queries for SLO metrics
    cat > "$PROMETHEUS_SNAPSHOT_DIR/slo_queries.txt" << 'QUERIES_EOF'
# Auth latency 95th percentile
histogram_quantile(0.95, rate(auth_request_duration_seconds_bucket[5m]))

# Upload success rate
(sum(rate(upload_requests_total{status="success"}[5m])) / sum(rate(upload_requests_total[5m]))) * 100

# WebSocket messages per second
rate(websocket_messages_total[5m])

# Database pool saturation
(postgres_connections_active / postgres_connections_max) * 100

# Firing alerts count
ALERTS{alertstate="firing"}
QUERIES_EOF
    
    # Query Prometheus for metrics
    local prometheus_url="http://localhost:9090"
    local query_time=$(date +%s)
    local failures=0
    
    # Auth latency check
    log "🔍 Checking auth latency (95th percentile)..."
    local auth_latency_query="histogram_quantile(0.95, rate(auth_request_duration_seconds_bucket[5m]))"
    local auth_latency_result=$(curl -s -G "$prometheus_url/api/v1/query" \
        --data-urlencode "query=$auth_latency_query" \
        --data-urlencode "time=$query_time" | \
        jq -r '.data.result[0].value[1] // "0"')
    
    local auth_latency_ms=$(echo "$auth_latency_result * 1000" | bc -l 2>/dev/null || echo "0")
    
    if (( $(echo "$auth_latency_ms > $AUTH_LATENCY_P95_THRESHOLD" | bc -l) )); then
        error "Auth latency P95 threshold exceeded: ${auth_latency_ms}ms > ${AUTH_LATENCY_P95_THRESHOLD}ms"
        ((failures++))
    else
        success "Auth latency P95 within threshold: ${auth_latency_ms}ms ≤ ${AUTH_LATENCY_P95_THRESHOLD}ms"
    fi
    
    # Upload success rate check
    log "🔍 Checking upload success rate..."
    local upload_success_query="(sum(rate(upload_requests_total{status=\"success\"}[5m])) / sum(rate(upload_requests_total[5m]))) * 100"
    local upload_success_result=$(curl -s -G "$prometheus_url/api/v1/query" \
        --data-urlencode "query=$upload_success_query" \
        --data-urlencode "time=$query_time" | \
        jq -r '.data.result[0].value[1] // "100"')
    
    if (( $(echo "$upload_success_result < $UPLOAD_SUCCESS_RATE_THRESHOLD" | bc -l) )); then
        error "Upload success rate below threshold: ${upload_success_result}% < ${UPLOAD_SUCCESS_RATE_THRESHOLD}%"
        ((failures++))
    else
        success "Upload success rate above threshold: ${upload_success_result}% ≥ ${UPLOAD_SUCCESS_RATE_THRESHOLD}%"
    fi
    
    # WebSocket message rate check
    log "🔍 Checking WebSocket message rate..."
    local websocket_rate_query="rate(websocket_messages_total[5m])"
    local websocket_rate_result=$(curl -s -G "$prometheus_url/api/v1/query" \
        --data-urlencode "query=$websocket_rate_query" \
        --data-urlencode "time=$query_time" | \
        jq -r '.data.result[0].value[1] // "0"')
    
    if (( $(echo "$websocket_rate_result < $WEBSOCKET_MSG_RATE_THRESHOLD" | bc -l) )); then
        error "WebSocket message rate below threshold: ${websocket_rate_result}/s < ${WEBSOCKET_MSG_RATE_THRESHOLD}/s"
        ((failures++))
    else
        success "WebSocket message rate above threshold: ${websocket_rate_result}/s ≥ ${WEBSOCKET_MSG_RATE_THRESHOLD}/s"
    fi
    
    # Database pool saturation check
    log "🔍 Checking database pool saturation..."
    local db_pool_query="(postgres_connections_active / postgres_connections_max) * 100"
    local db_pool_result=$(curl -s -G "$prometheus_url/api/v1/query" \
        --data-urlencode "query=$db_pool_query" \
        --data-urlencode "time=$query_time" | \
        jq -r '.data.result[0].value[1] // "0"')
    
    if (( $(echo "$db_pool_result > $DB_POOL_SATURATION_THRESHOLD" | bc -l) )); then
        error "Database pool saturation above threshold: ${db_pool_result}% > ${DB_POOL_SATURATION_THRESHOLD}%"
        ((failures++))
    else
        success "Database pool saturation below threshold: ${db_pool_result}% ≤ ${DB_POOL_SATURATION_THRESHOLD}%"
    fi
    
    # Check for firing alerts
    log "🔍 Checking for firing alerts..."
    local alerts_query="ALERTS{alertstate=\"firing\"}"
    local alerts_result=$(curl -s -G "$prometheus_url/api/v1/query" \
        --data-urlencode "query=$alerts_query" \
        --data-urlencode "time=$query_time" | \
        jq -r '.data.result | length')
    
    if [ "$alerts_result" -gt 0 ]; then
        error "Found $alerts_result firing alerts"
        ((failures++))
    else
        success "No firing alerts detected"
    fi
    
    # Save snapshot data
    cat > "$PROMETHEUS_SNAPSHOT_DIR/slo_results.json" << SNAPSHOT_EOF
{
  "timestamp": "$query_time",
  "auth_latency_p95_ms": $auth_latency_ms,
  "upload_success_rate_percent": $upload_success_result,
  "websocket_msg_rate_per_sec": $websocket_rate_result,
  "db_pool_saturation_percent": $db_pool_result,
  "firing_alerts_count": $alerts_result,
  "thresholds": {
    "auth_latency_p95_threshold_ms": $AUTH_LATENCY_P95_THRESHOLD,
    "upload_success_rate_threshold_percent": $UPLOAD_SUCCESS_RATE_THRESHOLD,
    "websocket_msg_rate_threshold_per_sec": $WEBSOCKET_MSG_RATE_THRESHOLD,
    "db_pool_saturation_threshold_percent": $DB_POOL_SATURATION_THRESHOLD
  },
  "slo_violations": $failures
}
SNAPSHOT_EOF
    
    log "📊 SLO evaluation results saved to $PROMETHEUS_SNAPSHOT_DIR/slo_results.json"
    
    return $failures
}

# Main validation pipeline
main() {
    log "🚀 Starting validation pipeline..."
    
    # Create artifacts directory
    mkdir -p "$ARTIFACTS_DIR"
    
    # Step 1: Start test environment
    log "🏁 Step 1: Starting test environment..."
    cd "$PROJECT_DIR"
    if make test-env-up; then
        success "Test environment started successfully"
    else
        error "Failed to start test environment"
        exit 1
    fi
    
    # Wait for services to be ready
    sleep 15
    
    # Check if main services are ready
    if ! check_service "http://localhost:4010/health" "API Gateway"; then
        error "API Gateway is not ready"
        exit 1
    fi
    
    # Step 2: Build candidate images
    log "🏗️  Step 2: Building candidate images..."
    if ! build_candidate_images; then
        error "Failed to build candidate images"
        exit 1
    fi
    
    # Step 3: Run Cypress E2E tests
    log "🧪 Step 3: Running Cypress E2E tests..."
    if ! run_cypress_tests; then
        error "Cypress tests failed"
        log "🔄 Initiating rollback..."
        "$SCRIPT_DIR/rollback.sh"
        exit 1
    fi
    
    # Step 4: Run k6 performance tests
    log "🚀 Step 4: Running k6 performance tests..."
    if ! run_k6_tests; then
        error "k6 tests failed"
        log "🔄 Initiating rollback..."
        "$SCRIPT_DIR/rollback.sh"
        exit 1
    fi
    
    # Step 5: Collect Prometheus snapshot and evaluate thresholds
    log "📊 Step 5: Collecting Prometheus snapshot and evaluating thresholds..."
    if ! collect_prometheus_snapshot; then
        error "SLO thresholds violated"
        log "🔄 Initiating rollback..."
        "$SCRIPT_DIR/rollback.sh"
        exit 1
    fi
    
    # Step 6: All tests passed - promote deployment
    log "🎉 Step 6: All validations passed - promoting deployment..."
    if "$SCRIPT_DIR/promote.sh"; then
        success "Deployment promoted successfully"
    else
        error "Failed to promote deployment"
        log "🔄 Initiating rollback..."
        "$SCRIPT_DIR/rollback.sh"
        exit 1
    fi
    
    success "🎯 Validation pipeline completed successfully!"
    log "📊 Artifacts available at: $ARTIFACTS_DIR"
    log "📈 Prometheus snapshot: $PROMETHEUS_SNAPSHOT_DIR"
    
    return 0
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
