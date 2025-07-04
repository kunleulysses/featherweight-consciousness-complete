#!/bin/bash

# Promotion Script for FlappyJournal Blue-Green Deployment
# This script handles promotion of environments to production

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

# Function to check environment health
check_environment_health() {
    local env="$1"
    local health_url
    
    if [[ "$env" == "blue" ]]; then
        health_url="http://blue.internal.featherweight.world/health"
    elif [[ "$env" == "green" ]]; then
        health_url="http://green.internal.featherweight.world/health"
    else
        log_error "Invalid environment: $env"
        return 1
    fi
    
    log_info "Checking health of $env environment"
    
    if curl -sf "$health_url" >/dev/null 2>&1; then
        log_success "$env environment is healthy"
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

# Function to validate promotion
validate_promotion() {
    local target_env="$1"
    local current_env
    current_env=$(get_current_environment)
    
    log_info "Validating promotion to $target_env environment"
    log_info "Current active environment: $current_env"
    
    # Check if target environment is different from current
    if [[ "$target_env" == "$current_env" ]]; then
        log_warning "$target_env is already the active environment"
        return 1
    fi
    
    # Check target environment health
    if ! check_environment_health "$target_env"; then
        log_error "Target environment $target_env is not healthy"
        return 1
    fi
    
    log_success "Validation passed for promoting $target_env to production"
    return 0
}

# Function to run post-promotion tests
run_promotion_tests() {
    log_info "Running post-promotion validation tests"
    
    # Basic health check
    if curl -sf "https://app.featherweight.world/api/health" >/dev/null 2>&1; then
        log_success "Production health check passed"
    else
        log_error "Production health check failed"
        return 1
    fi
    
    # Test key endpoints
    local endpoints=("/api/auth/health" "/api/health")
    
    for endpoint in "${endpoints[@]}"; do
        if curl -sf "https://app.featherweight.world$endpoint" >/dev/null 2>&1; then
            log_success "Endpoint $endpoint is responding"
        else
            log_warning "Endpoint $endpoint is not responding"
        fi
    done
    
    log_success "Post-promotion tests completed"
    return 0
}

# Function to promote environment
promote_environment() {
    local target_env="$1"
    local current_env
    current_env=$(get_current_environment)
    
    log_info "Starting promotion of $target_env environment to production"
    
    # Validate promotion
    if ! validate_promotion "$target_env"; then
        return 1
    fi
    
    # Confirm promotion
    if [[ "${FORCE_PROMOTION:-false}" != "true" ]]; then
        echo
        log_warning "This will switch production traffic from $current_env to $target_env"
        read -p "Are you sure you want to promote $target_env to production? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Promotion cancelled"
            return 0
        fi
    fi
    
    # Perform the promotion
    if switch_caddy_routing "$target_env"; then
        log_success "Successfully promoted $target_env to production"
        
        # Run post-promotion tests
        sleep 10
        run_promotion_tests
        
        # Log promotion
        cat >> "$DEPLOY_DIR/promotion.log" << EOL
$(date): Promoted $target_env to production (previous: $current_env)
Promoted by: ${USER:-system}
Force promotion: ${FORCE_PROMOTION:-false}
EOL
        
        return 0
    else
        log_error "Failed to promote $target_env to production"
        return 1
    fi
}

# Function to show environment status
show_status() {
    local current_env
    current_env=$(get_current_environment)
    
    echo "=== FlappyJournal Environment Status ==="
    echo "Current production environment: $current_env"
    echo "Production URL: https://app.featherweight.world"
    echo
    
    # Check health of both environments
    echo "Environment Health Status:"
    
    for env in blue green; do
        if check_environment_health "$env" >/dev/null 2>&1; then
            if [[ "$env" == "$current_env" ]]; then
                echo "  $env: ✅ Healthy (ACTIVE)"
            else
                echo "  $env: ✅ Healthy (standby)"
            fi
        else
            echo "  $env: ❌ Unhealthy/Not Running"
        fi
    done
    
    echo
    echo "Recent promotions:"
    if [[ -f "$DEPLOY_DIR/promotion.log" ]]; then
        tail -5 "$DEPLOY_DIR/promotion.log" | sed 's/^/  /'
    else
        echo "  No promotion history found"
    fi
}

# Function to prepare environment for promotion
prepare_environment() {
    local env="$1"
    local version="${2:-latest}"
    
    log_info "Preparing $env environment for promotion with version $version"
    
    cd "$DEPLOY_DIR"
    
    # Set environment variables
    if [[ "$env" == "blue" ]]; then
        export BLUE_TAG="$version"
    else
        export GREEN_TAG="$version"
    fi
    
    # Deploy the environment
    if docker compose -f docker-compose.blue-green.yml up -d "${env}"-auth-service "${env}"-consciousness-backend "${env}"-chat-orchestrator "${env}"-api-gateway; then
        log_success "$env environment deployed with version $version"
        
        # Wait for services to be ready
        sleep 30
        
        if check_environment_health "$env"; then
            log_success "$env environment is ready for promotion"
            return 0
        else
            log_error "$env environment failed health check"
            return 1
        fi
    else
        log_error "Failed to deploy $env environment"
        return 1
    fi
}

# Main function
main() {
    local action="${1:-status}"
    local target_env="${2:-}"
    local version="${3:-}"
    
    case "$action" in
        "promote")
            if [[ -z "$target_env" ]]; then
                log_error "Environment required for promotion"
                echo "Usage: $0 promote [blue|green]"
                exit 1
            fi
            
            if [[ "$target_env" != "blue" && "$target_env" != "green" ]]; then
                log_error "Invalid environment: $target_env (must be 'blue' or 'green')"
                exit 1
            fi
            
            promote_environment "$target_env"
            ;;
        "prepare")
            if [[ -z "$target_env" ]]; then
                log_error "Environment required for preparation"
                echo "Usage: $0 prepare [blue|green] [version]"
                exit 1
            fi
            
            prepare_environment "$target_env" "$version"
            ;;
        "validate")
            if [[ -z "$target_env" ]]; then
                log_error "Environment required for validation"
                echo "Usage: $0 validate [blue|green]"
                exit 1
            fi
            
            validate_promotion "$target_env"
            ;;
        "status"|"info")
            show_status
            ;;
        *)
            echo "FlappyJournal Promotion Script"
            echo
            echo "Usage: $0 [action] [environment] [version]"
            echo
            echo "Actions:"
            echo "  status     - Show current environment status (default)"
            echo "  promote    - Promote environment to production"
            echo "  prepare    - Prepare environment for promotion"
            echo "  validate   - Validate environment for promotion"
            echo
            echo "Environments:"
            echo "  blue       - Blue environment"
            echo "  green      - Green environment"
            echo
            echo "Environment Variables:"
            echo "  FORCE_PROMOTION=true   - Skip confirmation prompt"
            echo
            echo "Examples:"
            echo "  $0 status                    # Show current status"
            echo "  $0 validate blue             # Check if blue is ready"
            echo "  $0 prepare green v1.0.1      # Prepare green with v1.0.1"
            echo "  $0 promote blue              # Promote blue to production"
            echo "  FORCE_PROMOTION=true $0 promote green  # Force promote green"
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
