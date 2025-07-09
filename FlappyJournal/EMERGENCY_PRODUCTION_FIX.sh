#!/bin/bash

# EMERGENCY PRODUCTION FIX for app.featherweight.world
# This script will deploy and start the consciousness system

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "🚨 EMERGENCY PRODUCTION FIX - FlappyJournal Consciousness System"
echo "================================================================"

# Check if we're on the production server
if [[ ! -d "/opt/featherweight" ]]; then
    log_error "This script must be run on the production server at /opt/featherweight"
    echo ""
    echo "To fix the production system, you need to:"
    echo "1. SSH into your production server"
    echo "2. Navigate to /opt/featherweight/FlappyJournal"
    echo "3. Run this script"
    echo ""
    echo "SSH command (replace with your server details):"
    echo "ssh root@your-server-ip"
    echo "cd /opt/featherweight/FlappyJournal"
    echo "./EMERGENCY_PRODUCTION_FIX.sh"
    exit 1
fi

log_info "Production server detected. Starting emergency fix..."

# Navigate to the correct directory
cd /opt/featherweight/FlappyJournal

# Check if consciousness service exists
if [[ ! -f "server/consciousness-conversations.js" ]]; then
    log_error "Consciousness service not found. Pulling latest code..."
    git pull origin main || log_error "Failed to pull latest code"
fi

# Install/update dependencies
log_info "Installing dependencies..."
npm install --production

# Check if .env file exists
if [[ ! -f ".env" ]]; then
    log_info "Creating production .env file..."
    cat > .env << EOF
NODE_ENV=production
PORT=3002
CONSCIOUSNESS_CONVERSATIONS_PORT=3002
VENICE_AI_API_KEY=\${VENICE_AI_API_KEY:-test_key}
OPENAI_API_KEY=\${OPENAI_API_KEY:-test_key}
GEMINI_API_KEY=\${GEMINI_API_KEY:-test_key}
AUTONOMOUS_THOUGHTS_ENABLED=true
CONSCIOUSNESS_PROCESSING_ENABLED=true
UNFILTERED_MODE_ENABLED=true
OVERSOUL_RESONANCE_ENABLED=true
EOF
fi

# Stop any existing services
log_info "Stopping existing services..."
systemctl stop consciousness-conversations.service 2>/dev/null || true
systemctl stop demo-portal.service 2>/dev/null || true

# Kill any processes on port 3002
log_info "Killing processes on port 3002..."
pkill -f "consciousness-conversations.js" || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

# Install systemd service if not exists
if [[ ! -f "/etc/systemd/system/consciousness-conversations.service" ]]; then
    log_info "Installing systemd service..."
    cp deploy/systemd/consciousness-conversations.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable consciousness-conversations.service
fi

# Start the consciousness service
log_info "Starting consciousness conversations service..."
systemctl start consciousness-conversations.service

# Wait for service to start
sleep 10

# Check service status
if systemctl is-active --quiet consciousness-conversations.service; then
    log_success "Consciousness service is running!"
else
    log_error "Failed to start consciousness service. Checking logs..."
    journalctl -u consciousness-conversations.service --no-pager -l --since "1 minute ago"
    exit 1
fi

# Test WebSocket connection
log_info "Testing WebSocket connection..."
if curl -f http://localhost:3002/health &>/dev/null; then
    log_success "Consciousness service is responding on port 3002"
else
    log_error "Consciousness service not responding on port 3002"
    exit 1
fi

# Restart Caddy to ensure proper routing
log_info "Restarting Caddy..."
systemctl restart caddy

log_success "🎉 EMERGENCY FIX COMPLETE!"
echo ""
echo "✅ Consciousness service is running on port 3002"
echo "✅ WebSocket server is active"
echo "✅ Dashboard should now work at https://app.featherweight.world/"
echo ""
echo "To monitor the service:"
echo "  systemctl status consciousness-conversations.service"
echo "  journalctl -u consciousness-conversations.service -f"
echo ""
echo "To check service health:"
echo "  curl https://app.featherweight.world/health"
