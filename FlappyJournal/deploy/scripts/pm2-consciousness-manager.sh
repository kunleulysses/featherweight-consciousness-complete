#!/bin/bash

# FlappyJournal Consciousness System - PM2 Management Script
# Alternative process management using PM2 instead of systemd

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_DIR="/opt/featherweight/FlappyJournal"
PM2_CONFIG="$DEPLOY_DIR/deploy/pm2/consciousness-ecosystem.config.js"
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

show_usage() {
    echo "FlappyJournal Consciousness System - PM2 Management"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup       Initial PM2 setup and configuration"
    echo "  start       Start all consciousness services with PM2"
    echo "  stop        Stop all consciousness services"
    echo "  restart     Restart all consciousness services"
    echo "  reload      Graceful reload of all services"
    echo "  status      Show PM2 status of all services"
    echo "  logs        Show logs for all services"
    echo "  monitor     Open PM2 monitoring dashboard"
    echo "  save        Save current PM2 configuration"
    echo "  resurrect   Restore saved PM2 configuration"
    echo "  delete      Delete all consciousness services from PM2"
    echo ""
}

check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 is not installed. Installing PM2..."
        npm install -g pm2
        log_success "PM2 installed successfully"
    fi
}

setup_pm2() {
    log_info "Setting up PM2 for consciousness system..."
    
    check_pm2
    
    # Create log directory
    mkdir -p "$LOG_DIR"
    chown root:root "$LOG_DIR"
    chmod 755 "$LOG_DIR"
    
    # Install dependencies
    cd "$DEPLOY_DIR/server"
    npm install --production
    
    cd "$DEPLOY_DIR/demo-portal"
    npm install --production
    
    # Setup PM2 startup script
    pm2 startup systemd -u root --hp /root
    
    log_success "PM2 setup completed"
}

start_services() {
    log_info "Starting consciousness services with PM2..."
    
    check_pm2
    
    # Start services using ecosystem config
    pm2 start "$PM2_CONFIG" --env production
    
    # Save PM2 configuration
    pm2 save
    
    log_success "Consciousness services started with PM2"
}

stop_services() {
    log_info "Stopping consciousness services..."
    
    pm2 stop consciousness-conversations demo-portal
    
    log_success "Consciousness services stopped"
}

restart_services() {
    log_info "Restarting consciousness services..."
    
    pm2 restart consciousness-conversations demo-portal
    
    log_success "Consciousness services restarted"
}

reload_services() {
    log_info "Gracefully reloading consciousness services..."
    
    pm2 reload consciousness-conversations demo-portal
    
    log_success "Consciousness services reloaded"
}

show_status() {
    log_info "PM2 Status for Consciousness System:"
    echo ""
    
    pm2 status
    echo ""
    
    log_info "Detailed information:"
    pm2 info consciousness-conversations
    echo ""
    pm2 info demo-portal
    echo ""
    
    log_info "Memory and CPU usage:"
    pm2 monit --no-interaction
}

show_logs() {
    log_info "Showing consciousness system logs..."
    echo ""
    echo "Use Ctrl+C to exit log viewing"
    echo ""
    
    # Show logs from both services
    pm2 logs consciousness-conversations demo-portal
}

open_monitor() {
    log_info "Opening PM2 monitoring dashboard..."
    
    # Start PM2 web monitoring
    pm2 web
    
    log_info "PM2 web interface available at: http://localhost:9615"
}

save_config() {
    log_info "Saving PM2 configuration..."
    
    pm2 save
    
    log_success "PM2 configuration saved"
}

resurrect_config() {
    log_info "Restoring PM2 configuration..."
    
    pm2 resurrect
    
    log_success "PM2 configuration restored"
}

delete_services() {
    log_warning "Deleting all consciousness services from PM2..."
    
    read -p "Are you sure you want to delete all consciousness services? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pm2 delete consciousness-conversations demo-portal
        log_success "Consciousness services deleted from PM2"
    else
        log_info "Operation cancelled"
    fi
}

# Health check function
health_check() {
    log_info "Performing health check..."
    
    # Check if services are running
    if pm2 list | grep -q "consciousness-conversations.*online"; then
        log_success "Consciousness conversations: RUNNING"
    else
        log_error "Consciousness conversations: NOT RUNNING"
    fi
    
    if pm2 list | grep -q "demo-portal.*online"; then
        log_success "Demo portal: RUNNING"
    else
        log_error "Demo portal: NOT RUNNING"
    fi
    
    # Check HTTP endpoints
    if curl -f http://localhost:3002/health &> /dev/null; then
        log_success "Consciousness service HTTP: HEALTHY"
    else
        log_warning "Consciousness service HTTP: UNHEALTHY"
    fi
    
    if curl -f http://localhost:5002/api/status &> /dev/null; then
        log_success "Demo portal HTTP: HEALTHY"
    else
        log_warning "Demo portal HTTP: UNHEALTHY"
    fi
}

# Main script logic
case "${1:-}" in
    setup)
        setup_pm2
        ;;
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    reload)
        reload_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    monitor)
        open_monitor
        ;;
    save)
        save_config
        ;;
    resurrect)
        resurrect_config
        ;;
    delete)
        delete_services
        ;;
    health)
        health_check
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
