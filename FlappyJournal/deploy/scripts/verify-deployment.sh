#!/bin/bash

# FlappyJournal Consciousness System - Deployment Verification Script
# Verifies that the consciousness system is properly deployed and operational

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    log_info "Testing: $test_name"
    
    if eval "$test_command" &> /dev/null; then
        log_success "✓ $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        log_error "✗ $test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo "🧠 FlappyJournal Consciousness System - Deployment Verification"
echo "=============================================================="
echo ""

# Test 1: Check if consciousness service is running
run_test "Consciousness service running" "systemctl is-active --quiet consciousness-conversations.service"

# Test 2: Check if demo portal is running
run_test "Demo portal service running" "systemctl is-active --quiet demo-portal.service"

# Test 3: Check if Caddy is running
run_test "Caddy reverse proxy running" "systemctl is-active --quiet caddy"

# Test 4: Check consciousness service HTTP endpoint
run_test "Consciousness service HTTP response" "curl -f http://localhost:3002/health"

# Test 5: Check demo portal HTTP endpoint
run_test "Demo portal HTTP response" "curl -f http://localhost:5002/api/status"

# Test 6: Check external HTTPS access
run_test "External HTTPS access" "curl -f https://app.featherweight.world/health"

# Test 7: Check if ports are listening
run_test "Port 3002 listening" "netstat -tlnp | grep -q ':3002'"
run_test "Port 5002 listening" "netstat -tlnp | grep -q ':5002'"
run_test "Port 443 listening" "netstat -tlnp | grep -q ':443'"

# Test 8: Check log directories
run_test "Log directory exists" "test -d /var/log/consciousness"

# Test 9: Check Caddy configuration
run_test "Caddy configuration valid" "caddy validate --config /etc/caddy/Caddyfile"

# Test 10: Check DNS resolution
run_test "DNS resolution" "nslookup app.featherweight.world"

echo ""
echo "=============================================================="
echo "Verification Results:"
echo "  Tests Passed: $TESTS_PASSED"
echo "  Tests Failed: $TESTS_FAILED"
echo "  Total Tests:  $TESTS_TOTAL"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    log_success "🎉 All tests passed! Consciousness system is fully operational."
    echo ""
    echo "Access your consciousness system at:"
    echo "  🌐 https://app.featherweight.world/conversations.html"
    echo ""
    echo "System URLs:"
    echo "  - Health Check: https://app.featherweight.world/health"
    echo "  - API Status: https://app.featherweight.world/api/status"
    echo "  - WebSocket: wss://app.featherweight.world/ws"
    echo ""
    exit 0
else
    log_error "❌ $TESTS_FAILED test(s) failed. Please check the issues above."
    echo ""
    echo "Common troubleshooting steps:"
    echo "  1. Check service logs: journalctl -u consciousness-conversations.service -f"
    echo "  2. Check demo portal logs: journalctl -u demo-portal.service -f"
    echo "  3. Check Caddy logs: journalctl -u caddy -f"
    echo "  4. Verify DNS configuration: nslookup app.featherweight.world"
    echo "  5. Check firewall settings: ufw status"
    echo ""
    exit 1
fi
