#!/bin/bash

# Instant Rollback Script for FlappyJournal Blue-Green Deployment
# This script provides immediate rollback capability by switching between environments

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DEPLOY_DIR="$PROJECT_DIR/deploy"
CURRENT_ENV_FILE="${DEPLOY_DIR}/.current-environment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" >&2
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" >&2
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" >&2
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Function to get current active environment
get_current_environment() {
    if [[ -f "$CURRENT_ENV_FILE" ]]; then
        cat "$CURRENT_ENV_FILE"
    else
        echo "blue"
    fi
}

# Function to set current active environment
set_current_environment() {
    local env="$1"
    echo "$env" > "$CURRENT_ENV_FILE"
    log_info "Current active environment set to: $env"
}

# Function to get target environment for rollback
get_rollback_target() {
    local current="$1"
    if [[ "$current" == "blue" ]]; then
        echo "green"
    else
        echo "blue"
    fi
}

# Function to check if target environment is available
check_environment_availability() {
    local env="$1"
    
    log_info "Checking availability of $env environment"
    
    # Check if the environment containers are running
    cd "$DEPLOY_DIR"
    
    local containers
    containers=$(docker compose -f docker-compose.blue-green.yml ps --services --filter "status=running" | grep "^${env}-" || true)
    
    if [[ -z "$containers" ]]; then
        log_error "$env environment is not running"
        return 1
    fi
    
    # Check health of API gateway
    local health_url
    if [[ "$env" == "blue" ]]; then
        health_url="http://blue.internal.featherweight.world/health"
    else
        health_url="http://green.internal.featherweight.world/health"
    fi
    
    if curl -sf "$health_url" >/dev/null 2>&1; then
        log_success "$env environment is healthy and ready"
        return 0
    else
        log_error "$env environment health check failed"
        return 1
    fi
}

# Function to switch Caddy routing
switch_caddy_routing() {
    local target_env="$1"
    local caddy_config="$DEPLOY_DIR/caddy/Caddyfile.blue-green"
    
    log_info "Switching Caddy routing to $target_env environment"
    
    # Create new Caddyfile with updated routing
    if [[ "$target_env" == "blue" ]]; then
        sed 's/reverse_proxy green-api-gateway:4000/reverse_proxy blue-api-gateway:4000/' \
            "$caddy_config" > "$caddy_config.new"
    else
        sed 's/reverse_proxy blue-api-gateway:4000/reverse_proxy green-api-gateway:4000/' \
            "$caddy_config" > "$caddy_config.new"
    fi
    
    # Atomic replacement
    mv "$caddy_config.new" "$caddy_config"
    
    # Reload Caddy configuration
    if docker exec deploy-caddy-1 caddy reload --config /etc/caddy/Caddyfile 2>/dev/null; then
        log_success "Caddy configuration reloaded successfully"
        set_current_environment "$target_env"
        return 0
    else
        log_error "Failed to reload Caddy configuration"
        return 1
    fi
}

# Function to start backup environment if needed
start_backup_environment() {
    local env="$1"
    
    log_info "Starting $env environment for rollback"
    
    cd "$DEPLOY_DIR"
    
    # Start the environment with backup version
    export GREEN_TAG="${BACKUP_VERSION:-v0.9-backup}"
    
    if docker compose -f docker-compose.blue-green.yml --profile green up -d; then
        log_success "$env environment started successfully"
        
        # Wait for services to be ready
        sleep 30
        
        if check_environment_availability "$env"; then
            return 0
        else
            log_error "$env environment failed to become healthy"
            return 1
        fi
    else
        log_error "Failed to start $env environment"
        return 1
    fi
}

# Function to perform instant rollback
instant_rollback() {
    local current_env
    current_env=$(get_current_environment)
    local target_env
    target_env=$(get_rollback_target "$current_env")
    
    log_warning "INITIATING INSTANT ROLLBACK"
    log_info "Current environment: $current_env"
    log_info "Target environment: $target_env"
    
    # Check if target environment is available
    if check_environment_availability "$target_env"; then
        log_info "Target environment is ready, performing instant switch"
    else
        log_warning "Target environment not available, attempting to start backup environment"
        if ! start_backup_environment "$target_env"; then
            log_error "Failed to start backup environment"
            return 1
        fi
    fi
    
    # Perform the switch
    if switch_caddy_routing "$target_env"; then
        log_success "ROLLBACK COMPLETED SUCCESSFULLY"
        log_success "Traffic switched from $current_env to $target_env"
        
        # Log rollback information
        cat >> "$DEPLOY_DIR/rollback.log" << EOL
$(date): ROLLBACK executed - switched from $current_env to $target_env
Reason: ${ROLLBACK_REASON:-Manual rollback initiated}
EOL
        
        return 0
    else
        log_error "ROLLBACK FAILED - traffic switch unsuccessful"
        return 1
    fi
}

# Function to show current status
show_status() {
    local current_env
    current_env=$(get_current_environment)
    
    echo "=== FlappyJournal Deployment Status ==="
    echo "Current active environment: $current_env"
    echo "Production URL: https://app.featherweight.world"
    echo "Staging URL: https://staging.app.featherweight.world"
    echo
    
    # Check health of both environments
    echo "Environment Health Status:"
    
    for env in blue green; do
        local health_url
        if [[ "$env" == "blue" ]]; then
            health_url="http://blue.internal.featherweight.world/health"
        else
            health_url="http://green.internal.featherweight.world/health"
        fi
        
        if curl -sf "$health_url" >/dev/null 2>&1; then
            echo "  $env: ✅ Healthy"
        else
            echo "  $env: ❌ Unhealthy/Not Running"
        fi
    done
    
    echo
    echo "Recent deployments:"
    if [[ -f "$DEPLOY_DIR/deployment.log" ]]; then
        tail -5 "$DEPLOY_DIR/deployment.log" | sed 's/^/  /'
    else
        echo "  No deployment history found"
    fi
    
    echo
    echo "Recent rollbacks:"
    if [[ -f "$DEPLOY_DIR/rollback.log" ]]; then
        tail -5 "$DEPLOY_DIR/rollback.log" | sed 's/^/  /'
    else
        echo "  No rollback history found"
    fi
}

# Function to validate environment before rollback
validate_rollback() {
    local current_env
    current_env=$(get_current_environment)
    local target_env
    target_env=$(get_rollback_target "$current_env")
    
    echo "=== Rollback Validation ==="
    echo "Current environment: $current_env"
    echo "Target environment: $target_env"
    echo
    
    # Check if rollback is possible
    if [[ "$current_env" == "$target_env" ]]; then
        log_error "Cannot rollback: no alternative environment detected"
        return 1
    fi
    
    # Check target environment availability
    if check_environment_availability "$target_env"; then
        log_success "Rollback target ($target_env) is healthy and ready"
        return 0
    else
        log_warning "Rollback target ($target_env) is not ready"
        log_info "Rollback will attempt to start backup environment"
        return 0
    fi
}

# Main function
main() {
    local action="${1:-status}"
    
    case "$action" in
        "rollback"|"execute")
            log_warning "EMERGENCY ROLLBACK INITIATED"
            echo "This will immediately switch production traffic to the backup environment."
            echo
            
            if [[ "${FORCE_ROLLBACK:-false}" != "true" ]]; then
                read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
                echo
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    log_info "Rollback cancelled"
                    exit 0
                fi
            fi
            
            instant_rollback
            ;;
        "validate"|"check")
            validate_rollback
            ;;
        "status"|"info")
            show_status
            ;;
        "start-backup")
            local target_env="${2:-green}"
            start_backup_environment "$target_env"
            ;;
        *)
            echo "FlappyJournal Rollback Script"
            echo
            echo "Usage: $0 [action]"
            echo
            echo "Actions:"
            echo "  status     - Show current deployment status (default)"
            echo "  validate   - Check if rollback is possible"
            echo "  rollback   - Execute emergency rollback"
            echo "  start-backup - Start backup environment"
            echo
            echo "Environment Variables:"
            echo "  FORCE_ROLLBACK=true   - Skip confirmation prompt"
            echo "  ROLLBACK_REASON=text  - Log reason for rollback"
            echo
            echo "Examples:"
            echo "  $0 status              # Show current status"
            echo "  $0 validate            # Check rollback readiness"
            echo "  FORCE_ROLLBACK=true $0 rollback  # Emergency rollback"
            echo
            exit 1
            ;;
    esac
}

# Ensure Docker is running
if ! docker info >/dev/null 2>&1; then
    log_error "Docker is not running or not accessible"
    exit 1
fi

# Ensure we're in the right directory
if [[ ! -f "$DEPLOY_DIR/docker-compose.blue-green.yml" ]]; then
    log_error "Blue-green docker-compose file not found"
    exit 1
fi

main "$@"
