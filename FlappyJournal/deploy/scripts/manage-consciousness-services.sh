#!/bin/bash

# FlappyJournal Consciousness System - Service Management Script
# Provides easy management of consciousness services

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

show_usage() {
    echo "FlappyJournal Consciousness System - Service Management"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start all consciousness services"
    echo "  stop        Stop all consciousness services"
    echo "  restart     Restart all consciousness services"
    echo "  status      Show status of all services"
    echo "  logs        Show logs for all services"
    echo "  health      Check health of all services"
    echo "  backup      Create backup of consciousness data"
    echo "  update      Update and restart services"
    echo ""
    echo "Individual service commands:"
    echo "  start-consciousness    Start only consciousness conversations"
    echo "  start-portal          Start only demo portal"
    echo "  stop-consciousness    Stop only consciousness conversations"
    echo "  stop-portal          Stop only demo portal"
    echo ""
}

start_all() {
    log_info "Starting all consciousness services..."
    
    systemctl start consciousness-conversations.service
    sleep 5
    systemctl start demo-portal.service
    sleep 3
    
    if systemctl is-active --quiet consciousness-conversations.service && \
       systemctl is-active --quiet demo-portal.service; then
        log_success "All consciousness services started successfully"
    else
        log_error "Failed to start some services"
        show_status
        exit 1
    fi
}

stop_all() {
    log_info "Stopping all consciousness services..."
    
    systemctl stop demo-portal.service
    systemctl stop consciousness-conversations.service
    
    log_success "All consciousness services stopped"
}

restart_all() {
    log_info "Restarting all consciousness services..."
    
    stop_all
    sleep 2
    start_all
}

show_status() {
    log_info "Consciousness System Status:"
    echo ""
    
    echo "=== Consciousness Conversations Service ==="
    systemctl status consciousness-conversations.service --no-pager -l
    echo ""
    
    echo "=== Demo Portal Service ==="
    systemctl status demo-portal.service --no-pager -l
    echo ""
    
    echo "=== Caddy Reverse Proxy ==="
    systemctl status caddy --no-pager -l
    echo ""
    
    echo "=== Port Status ==="
    netstat -tlnp | grep -E ':(3002|5002|80|443)' || echo "No services listening on expected ports"
    echo ""
}

show_logs() {
    log_info "Showing consciousness system logs..."
    echo ""
    echo "Use Ctrl+C to exit log viewing"
    echo ""
    
    # Show logs from all services
    journalctl -u consciousness-conversations.service -u demo-portal.service -u caddy -f
}

check_health() {
    log_info "Checking consciousness system health..."
    
    # Check consciousness service
    if curl -f http://localhost:3002/health &> /dev/null; then
        log_success "Consciousness conversations service: HEALTHY"
    else
        log_error "Consciousness conversations service: UNHEALTHY"
    fi
    
    # Check demo portal
    if curl -f http://localhost:5002/api/status &> /dev/null; then
        log_success "Demo portal service: HEALTHY"
    else
        log_error "Demo portal service: UNHEALTHY"
    fi
    
    # Check external access
    if curl -f https://app.featherweight.world/health &> /dev/null; then
        log_success "External access: HEALTHY"
    else
        log_warning "External access: Check DNS/Caddy configuration"
    fi
    
    # Check WebSocket
    log_info "WebSocket connectivity test (manual verification required)"
    echo "Visit: https://app.featherweight.world/conversations.html"
}

create_backup() {
    log_info "Creating consciousness system backup..."
    
    BACKUP_DIR="/var/backups/consciousness"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/consciousness_backup_$TIMESTAMP.tar.gz"
    
    mkdir -p "$BACKUP_DIR"
    
    # Create backup
    tar -czf "$BACKUP_FILE" \
        -C /opt/featherweight/FlappyJournal \
        server/consciousness-conversations.js \
        server/unified-consciousness-system.js \
        server/spiral-synapse-interface.js \
        demo-portal/ \
        Caddyfile \
        deploy/systemd/ \
        --exclude=node_modules \
        --exclude=logs
    
    log_success "Backup created: $BACKUP_FILE"
}

update_services() {
    log_info "Updating consciousness services..."
    
    # Pull latest changes (if using git)
    cd /opt/featherweight/FlappyJournal
    if [[ -d .git ]]; then
        git pull origin main
    fi
    
    # Update dependencies
    cd server && npm install --production
    cd ../demo-portal && npm install --production
    
    # Restart services
    restart_all
    
    log_success "Services updated and restarted"
}

start_consciousness() {
    log_info "Starting consciousness conversations service..."
    systemctl start consciousness-conversations.service
    log_success "Consciousness conversations service started"
}

start_portal() {
    log_info "Starting demo portal service..."
    systemctl start demo-portal.service
    log_success "Demo portal service started"
}

stop_consciousness() {
    log_info "Stopping consciousness conversations service..."
    systemctl stop consciousness-conversations.service
    log_success "Consciousness conversations service stopped"
}

stop_portal() {
    log_info "Stopping demo portal service..."
    systemctl stop demo-portal.service
    log_success "Demo portal service stopped"
}

# Main script logic
case "${1:-}" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_all
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    health)
        check_health
        ;;
    backup)
        create_backup
        ;;
    update)
        update_services
        ;;
    start-consciousness)
        start_consciousness
        ;;
    start-portal)
        start_portal
        ;;
    stop-consciousness)
        stop_consciousness
        ;;
    stop-portal)
        stop_portal
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
