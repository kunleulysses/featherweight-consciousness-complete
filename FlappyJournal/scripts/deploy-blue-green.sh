#!/bin/bash

# Blue-Green Deployment Script for FlappyJournal v1.0-full-tech
# This script handles controlled rollout with staging validation and instant rollback capability

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DEPLOY_DIR="$PROJECT_DIR/deploy"

# Default values
REGISTRY="${REGISTRY:-ghcr.io/featherweight}"
NEW_VERSION="${NEW_VERSION:-v1.0-full-tech}"
BACKUP_VERSION="${BACKUP_VERSION:-v0.9-backup}"
STAGING_DOMAIN="${STAGING_DOMAIN:-staging.app.featherweight.world}"
PRODUCTION_DOMAIN="${PRODUCTION_DOMAIN:-app.featherweight.world}"
CURRENT_ENV_FILE="${DEPLOY_DIR}/.current-environment"
TIMEOUT="${TIMEOUT:-300}"

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

# Error handling
cleanup() {
    if [[ $? -ne 0 ]]; then
        log_error "Deployment failed. Check logs above for details."
        log_info "Consider running rollback: ./scripts/rollback.sh"
    fi
}
trap cleanup EXIT

# Function to check if a service is healthy
check_service_health() {
    local url="$1"
    local max_attempts="${2:-30}"
    local attempt=1

    log_info "Checking health of $url"
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -sf "$url/health" >/dev/null 2>&1; then
            log_success "Service at $url is healthy"
            return 0
        fi
        
        log_info "Attempt $attempt/$max_attempts: Service not ready, waiting 10s..."
        sleep 10
        ((attempt++))
    done
    
    log_error "Service at $url failed health check after $max_attempts attempts"
    return 1
}

# Function to run Cypress tests
run_cypress_tests() {
    local base_url="$1"
    local test_name="$2"
    
    log_info "Running Cypress tests against $base_url"
    
    cd "$PROJECT_DIR"
    
    # Create temporary Cypress config for the test environment
    cat > cypress.config.temp.js << EOL
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: '$base_url',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    videosFolder: 'cypress/videos/$test_name',
    screenshotsFolder: 'cypress/screenshots/$test_name',
    video: true,
    screenshots: true,
    defaultCommandTimeout: 15000,
    requestTimeout: 30000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,
    viewportWidth: 1280,
    viewportHeight: 720,
    chromeWebSecurity: false,
    env: {
      apiUrl: '$base_url/api',
      testEnv: '$test_name'
    }
  },
})
EOL

    # Run the tests
    if npx cypress run --config-file cypress.config.temp.js --reporter json --reporter-options "output=cypress-results-$test_name.json"; then
        log_success "Cypress tests passed for $test_name environment"
        rm -f cypress.config.temp.js
        return 0
    else
        log_error "Cypress tests failed for $test_name environment"
        rm -f cypress.config.temp.js
        return 1
    fi
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

# Function to switch Caddy configuration
switch_caddy_routing() {
    local target_env="$1"
    local caddy_config="$DEPLOY_DIR/caddy/Caddyfile.blue-green"
    
    log_info "Switching Caddy routing to $target_env environment"
    
    # Create new Caddyfile with updated routing
    sed "s/reverse_proxy blue-api-gateway:4000/reverse_proxy ${target_env}-api-gateway:4000/" \
        "$caddy_config" > "$caddy_config.new"
    
    # Atomic replacement
    mv "$caddy_config.new" "$caddy_config"
    
    # Reload Caddy configuration
    if docker exec deploy-caddy-1 caddy reload --config /etc/caddy/Caddyfile; then
        log_success "Caddy configuration reloaded successfully"
        set_current_environment "$target_env"
        return 0
    else
        log_error "Failed to reload Caddy configuration"
        return 1
    fi
}

# Function to create image backups
create_image_backup() {
    local version="$1"
    
    log_info "Creating backup tags for version $version"
    
    # List of services to backup
    local services=("auth" "consciousness" "chat" "gateway")
    
    for service in "${services[@]}"; do
        local current_image="${REGISTRY}/flappyjournal-${service}:${version}"
        local backup_image="${REGISTRY}/flappyjournal-${service}:${BACKUP_VERSION}"
        
        log_info "Tagging $current_image as $backup_image"
        if docker tag "$current_image" "$backup_image"; then
            log_success "Successfully tagged backup for $service"
        else
            log_warning "Failed to tag backup for $service"
        fi
    done
}

# Main deployment function
deploy_to_staging() {
    log_info "Starting deployment to staging environment"
    
    cd "$DEPLOY_DIR"
    
    # Set staging environment variables
    export STAGING_TAG="$NEW_VERSION"
    
    # Deploy staging environment
    log_info "Deploying staging stack with version $NEW_VERSION"
    if docker compose -f docker-compose.blue-green.yml --profile staging up -d; then
        log_success "Staging environment deployed successfully"
    else
        log_error "Failed to deploy staging environment"
        return 1
    fi
    
    # Wait for services to be ready
    sleep 30
    
    # Check staging health
    if check_service_health "https://$STAGING_DOMAIN"; then
        log_success "Staging environment is healthy"
    else
        log_error "Staging environment health check failed"
        return 1
    fi
    
    # Run Cypress tests on staging
    if run_cypress_tests "https://$STAGING_DOMAIN" "staging"; then
        log_success "Staging validation tests passed"
        return 0
    else
        log_error "Staging validation tests failed"
        return 1
    fi
}

# Function to deploy to production blue environment
deploy_to_blue() {
    log_info "Deploying to blue (production candidate) environment"
    
    cd "$DEPLOY_DIR"
    
    # Set blue environment variables
    export BLUE_TAG="$NEW_VERSION"
    
    # Deploy blue environment
    log_info "Deploying blue stack with version $NEW_VERSION"
    if docker compose -f docker-compose.blue-green.yml up -d blue-auth-service blue-consciousness-backend blue-chat-orchestrator blue-api-gateway; then
        log_success "Blue environment deployed successfully"
    else
        log_error "Failed to deploy blue environment"
        return 1
    fi
    
    # Wait for services to be ready
    sleep 30
    
    # Check blue environment health (internal access)
    if check_service_health "http://blue.internal.featherweight.world"; then
        log_success "Blue environment is healthy"
        return 0
    else
        log_error "Blue environment health check failed"
        return 1
    fi
}

# Function to promote blue to production
promote_to_production() {
    local current_env
    current_env=$(get_current_environment)
    
    log_info "Promoting blue environment to production (currently: $current_env)"
    
    # Create backup of current production
    if [[ "$current_env" == "green" ]]; then
        create_image_backup "$GREEN_TAG"
    fi
    
    # Switch traffic to blue
    if switch_caddy_routing "blue"; then
        log_success "Traffic successfully switched to blue environment"
        log_success "Deployment completed! Version $NEW_VERSION is now live."
        
        # Log deployment information
        cat >> "$DEPLOY_DIR/deployment.log" << EOL
$(date): Deployed version $NEW_VERSION to production (blue environment)
Previous environment: $current_env
Backup version: $BACKUP_VERSION
EOL
        
        return 0
    else
        log_error "Failed to switch traffic to blue environment"
        return 1
    fi
}

# Main deployment flow
main() {
    log_info "Starting Blue-Green deployment for FlappyJournal $NEW_VERSION"
    log_info "Backup version: $BACKUP_VERSION"
    log_info "Registry: $REGISTRY"
    
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
    
    # Step 1: Deploy and validate staging
    if deploy_to_staging; then
        log_success "Staging deployment and validation completed"
    else
        log_error "Staging deployment failed"
        exit 1
    fi
    
    # Step 2: Deploy to blue environment
    if deploy_to_blue; then
        log_success "Blue environment deployment completed"
    else
        log_error "Blue environment deployment failed"
        exit 1
    fi
    
    # Step 3: Promote to production (with confirmation)
    if [[ "${AUTO_PROMOTE:-false}" == "true" ]]; then
        promote_to_production
    else
        echo
        log_warning "Ready to promote to production. Current environment: $(get_current_environment)"
        read -p "Promote blue environment to production? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            promote_to_production
        else
            log_info "Promotion cancelled. Blue environment ready for manual promotion."
            log_info "To promote later, run: ./scripts/promote.sh blue"
        fi
    fi
}

# Handle command line arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "staging-only")
        deploy_to_staging
        ;;
    "blue-only")
        deploy_to_blue
        ;;
    "promote")
        promote_to_production
        ;;
    *)
        echo "Usage: $0 [deploy|staging-only|blue-only|promote]"
        echo "  deploy: Full deployment pipeline (default)"
        echo "  staging-only: Deploy and test staging only"
        echo "  blue-only: Deploy to blue environment only"
        echo "  promote: Promote blue to production"
        exit 1
        ;;
esac
