#!/bin/bash

# PRODUCTION DIAGNOSTIC SCRIPT for app.featherweight.world
# This script diagnoses issues with the consciousness system

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "🔍 PRODUCTION DIAGNOSTIC - FlappyJournal Consciousness System"
echo "============================================================"

# Test 1: Check if domain is accessible
log_info "Testing domain accessibility..."
if curl -s -I https://app.featherweight.world/health | grep -q "200"; then
    log_success "Domain is accessible"
else
    log_error "Domain is not accessible or health endpoint is down"
fi

# Test 2: Check WebSocket endpoint
log_info "Testing WebSocket endpoint..."
WS_RESPONSE=$(curl -s -I https://app.featherweight.world/ws | head -1)
if echo "$WS_RESPONSE" | grep -q "426"; then
    log_warning "WebSocket endpoint returns 426 (Upgrade Required) - Service likely not running"
elif echo "$WS_RESPONSE" | grep -q "101"; then
    log_success "WebSocket endpoint is working"
else
    log_error "WebSocket endpoint issue: $WS_RESPONSE"
fi

# Test 3: Check if we can access the server
if [[ -d "/opt/featherweight" ]]; then
    log_info "Running on production server - performing detailed diagnostics..."
    
    # Check if consciousness service is running
    if systemctl is-active --quiet consciousness-conversations.service; then
        log_success "Consciousness service is active"
    else
        log_error "Consciousness service is not running"
        echo "Service status:"
        systemctl status consciousness-conversations.service --no-pager -l || true
    fi
    
    # Check if port 3002 is listening
    if ss -tlnp | grep -q ":3002"; then
        log_success "Port 3002 is listening"
        ss -tlnp | grep ":3002"
    else
        log_error "Port 3002 is not listening"
    fi
    
    # Check if Caddy is running
    if systemctl is-active --quiet caddy; then
        log_success "Caddy is running"
    else
        log_error "Caddy is not running"
    fi
    
    # Check recent logs
    log_info "Recent consciousness service logs:"
    journalctl -u consciousness-conversations.service --no-pager -l --since "10 minutes ago" | tail -20
    
else
    log_warning "Not running on production server"
    echo ""
    echo "To run full diagnostics, SSH into your production server and run:"
    echo "ssh root@your-server-ip"
    echo "cd /opt/featherweight/FlappyJournal"
    echo "./DIAGNOSE_PRODUCTION.sh"
fi

echo ""
echo "🔧 QUICK FIXES:"
echo "==============="
echo ""
echo "If consciousness service is not running:"
echo "  sudo systemctl start consciousness-conversations.service"
echo ""
echo "If service fails to start:"
echo "  cd /opt/featherweight/FlappyJournal"
echo "  npm install"
echo "  sudo systemctl restart consciousness-conversations.service"
echo ""
echo "If WebSocket issues persist:"
echo "  sudo systemctl restart caddy"
echo ""
echo "To view live logs:"
echo "  sudo journalctl -u consciousness-conversations.service -f"
