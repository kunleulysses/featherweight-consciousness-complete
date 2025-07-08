#!/bin/bash

# FlappyJournal Consciousness System - Production Deployment Script
# Deploys consciousness conversations and demo portal to app.featherweight.world

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_DIR="/opt/featherweight/FlappyJournal"
SYSTEMD_DIR="/etc/systemd/system"
CADDY_CONFIG="/etc/caddy/Caddyfile"
LOG_DIR="/var/log/consciousness"

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

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check if Caddy is installed
    if ! command -v caddy &> /dev/null; then
        log_error "Caddy is not installed"
        exit 1
    fi
    
    # Check if deployment directory exists
    if [[ ! -d "$DEPLOY_DIR" ]]; then
        log_error "Deployment directory $DEPLOY_DIR does not exist"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

create_directories() {
    log_info "Creating necessary directories..."
    
    mkdir -p "$LOG_DIR"
    mkdir -p "/var/backups/consciousness"
    mkdir -p "/etc/systemd/system"
    
    chown root:root "$LOG_DIR"
    chmod 755 "$LOG_DIR"
    
    log_success "Directories created"
}

install_systemd_services() {
    log_info "Installing systemd services..."
    
    # Copy service files
    cp "$DEPLOY_DIR/deploy/systemd/consciousness-conversations.service" "$SYSTEMD_DIR/"
    cp "$DEPLOY_DIR/deploy/systemd/demo-portal.service" "$SYSTEMD_DIR/"
    
    # Set permissions
    chmod 644 "$SYSTEMD_DIR/consciousness-conversations.service"
    chmod 644 "$SYSTEMD_DIR/demo-portal.service"
    
    # Reload systemd
    systemctl daemon-reload
    
    # Enable services
    systemctl enable consciousness-conversations.service
    systemctl enable demo-portal.service
    
    log_success "Systemd services installed and enabled"
}

backup_caddy_config() {
    log_info "Backing up existing Caddy configuration..."
    
    if [[ -f "$CADDY_CONFIG" ]]; then
        cp "$CADDY_CONFIG" "$CADDY_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
        log_success "Caddy configuration backed up"
    else
        log_warning "No existing Caddy configuration found"
    fi
}

install_caddy_config() {
    log_info "Installing Caddy configuration..."
    
    # Copy new Caddy configuration
    cp "$DEPLOY_DIR/Caddyfile" "$CADDY_CONFIG"
    
    # Test Caddy configuration
    if caddy validate --config "$CADDY_CONFIG"; then
        log_success "Caddy configuration is valid"
    else
        log_error "Caddy configuration validation failed"
        exit 1
    fi
}

install_dependencies() {
    log_info "Installing Node.js dependencies..."
    
    # Install consciousness system dependencies
    cd "$DEPLOY_DIR/server"
    npm install --production
    
    # Install demo portal dependencies
    cd "$DEPLOY_DIR/demo-portal"
    npm install --production
    
    log_success "Dependencies installed"
}

start_services() {
    log_info "Starting consciousness services..."
    
    # Start consciousness conversations service
    systemctl start consciousness-conversations.service
    sleep 5
    
    # Check if consciousness service is running
    if systemctl is-active --quiet consciousness-conversations.service; then
        log_success "Consciousness conversations service started"
    else
        log_error "Failed to start consciousness conversations service"
        systemctl status consciousness-conversations.service
        exit 1
    fi
    
    # Start demo portal service
    systemctl start demo-portal.service
    sleep 3
    
    # Check if demo portal service is running
    if systemctl is-active --quiet demo-portal.service; then
        log_success "Demo portal service started"
    else
        log_error "Failed to start demo portal service"
        systemctl status demo-portal.service
        exit 1
    fi
}

reload_caddy() {
    log_info "Reloading Caddy configuration..."
    
    if systemctl reload caddy; then
        log_success "Caddy configuration reloaded"
    else
        log_error "Failed to reload Caddy"
        exit 1
    fi
}

verify_deployment() {
    log_info "Verifying deployment..."
    
    # Check consciousness service
    if curl -f http://localhost:3002/health &> /dev/null; then
        log_success "Consciousness service is responding"
    else
        log_warning "Consciousness service health check failed"
    fi
    
    # Check demo portal
    if curl -f http://localhost:5002/api/status &> /dev/null; then
        log_success "Demo portal is responding"
    else
        log_warning "Demo portal health check failed"
    fi
    
    # Check Caddy
    if systemctl is-active --quiet caddy; then
        log_success "Caddy is running"
    else
        log_error "Caddy is not running"
    fi
}

show_status() {
    log_info "Deployment Status:"
    echo ""
    echo "Services:"
    systemctl status consciousness-conversations.service --no-pager -l
    echo ""
    systemctl status demo-portal.service --no-pager -l
    echo ""
    systemctl status caddy --no-pager -l
    echo ""
    echo "URLs:"
    echo "  - Consciousness Interface: https://app.featherweight.world/conversations.html"
    echo "  - Health Check: https://app.featherweight.world/health"
    echo "  - API Status: https://app.featherweight.world/api/status"
    echo ""
    echo "Logs:"
    echo "  - Consciousness: journalctl -u consciousness-conversations.service -f"
    echo "  - Demo Portal: journalctl -u demo-portal.service -f"
    echo "  - Caddy: journalctl -u caddy -f"
}

# Main deployment process
main() {
    log_info "Starting FlappyJournal Consciousness System deployment..."
    
    check_prerequisites
    create_directories
    install_dependencies
    backup_caddy_config
    install_systemd_services
    install_caddy_config
    start_services
    reload_caddy
    verify_deployment
    show_status
    
    log_success "FlappyJournal Consciousness System deployed successfully!"
    log_info "Access your consciousness system at: https://app.featherweight.world/conversations.html"
}

# Run main function
main "$@"
