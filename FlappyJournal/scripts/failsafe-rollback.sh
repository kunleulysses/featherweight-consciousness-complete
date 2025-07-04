#!/bin/bash

# Fail-Safe Rollback Script
# Monitors error rates and performance, triggers rollback if thresholds exceeded

set -euo pipefail

# Configuration
ERROR_THRESHOLD=1.0    # 1% error rate threshold
PERFORMANCE_THRESHOLD=95  # 95% success rate threshold
ROLLBACK_TAG="prev_tag"
CURRENT_TAG=$(date +%Y%m%d)
LOG_FILE="/var/log/failsafe-rollback.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Health check function
check_service_health() {
    local service_name="$1"
    local health_url="$2"
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s --connect-timeout 5 --max-time 10 "$health_url" > /dev/null 2>&1; then
            return 0
        fi
        log "⚠️ Health check failed for $service_name (attempt $attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    return 1
}

# Performance metrics collection
collect_metrics() {
    log "📊 Collecting performance metrics..."
    
    # API Gateway metrics
    local api_health=$(curl -f -s --connect-timeout 5 "http://localhost:4000/api/health" || echo "unhealthy")
    
    # Service health checks
    local auth_health=$(curl -f -s --connect-timeout 5 "http://localhost:4001/health" || echo "unhealthy")
    local chat_health=$(curl -f -s --connect-timeout 5 "http://localhost:4002/health" || echo "unhealthy")
    local consciousness_health=$(curl -f -s --connect-timeout 5 "http://localhost:4003/health" || echo "unhealthy")
    local ws_health=$(curl -f -s --connect-timeout 5 "http://localhost:4004/health" || echo "unhealthy")
    
    # Calculate health score
    local healthy_services=0
    local total_services=5
    
    [[ "$api_health" != "unhealthy" ]] && ((healthy_services++))
    [[ "$auth_health" != "unhealthy" ]] && ((healthy_services++))
    [[ "$chat_health" != "unhealthy" ]] && ((healthy_services++))
    [[ "$consciousness_health" != "unhealthy" ]] && ((healthy_services++))
    [[ "$ws_health" != "unhealthy" ]] && ((healthy_services++))
    
    local health_percentage=$((healthy_services * 100 / total_services))
    
    echo "$health_percentage"
}

# Docker container status check
check_container_status() {
    log "🐳 Checking Docker container status..."
    
    local failing_containers=0
    local total_containers=0
    
    # Get all running containers from our stack
    while IFS= read -r container; do
        if [[ -n "$container" ]]; then
            ((total_containers++))
            local status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "not_found")
            if [[ "$status" != "running" ]]; then
                log "❌ Container $container is not running (status: $status)"
                ((failing_containers++))
            fi
        fi
    done < <(docker ps -q --filter "label=com.docker.compose.project")
    
    if [ $total_containers -eq 0 ]; then
        log "⚠️ No containers found. Checking docker-compose services..."
        # Fallback: check if docker-compose services are running
        cd /opt/featherweight/FlappyJournal/deploy
        local compose_status=$(docker-compose ps -q 2>/dev/null | wc -l)
        if [ "$compose_status" -eq 0 ]; then
            return 1
        fi
    fi
    
    local container_health_percentage=$(( (total_containers - failing_containers) * 100 / (total_containers > 0 ? total_containers : 1) ))
    echo "$container_health_percentage"
}

# Trigger rollback
trigger_rollback() {
    log "🚨 TRIGGERING EMERGENCY ROLLBACK"
    
    cd /opt/featherweight/FlappyJournal/deploy
    
    # Stop current deployment
    log "⏹️ Stopping current deployment..."
    docker-compose down || true
    
    # Wait a moment for cleanup
    sleep 5
    
    # Start with previous tag
    log "🔄 Starting rollback to previous version..."
    
    # Check if we have a previous tag to rollback to
    if docker images | grep -q "featherweight.*$ROLLBACK_TAG"; then
        # Update docker-compose to use previous tag
        sed -i.bak "s/latest/$ROLLBACK_TAG/g" docker-compose.yml
        docker-compose up -d
    else
        log "⚠️ No previous tag found, starting with latest..."
        docker-compose up -d
    fi
    
    # Wait for services to start
    sleep 30
    
    # Verify rollback success
    local post_rollback_health=$(collect_metrics)
    if [ "$post_rollback_health" -ge 80 ]; then
        log "✅ Rollback successful. Health: $post_rollback_health%"
        
        # Send notification (if notification system exists)
        curl -X POST -H "Content-Type: application/json" \
             -d "{\"message\":\"🚨 Emergency rollback completed. System health: $post_rollback_health%\"}" \
             "http://localhost:4000/api/notifications" 2>/dev/null || true
             
        return 0
    else
        log "❌ Rollback failed. Health: $post_rollback_health%"
        return 1
    fi
}

# Tag stable images
tag_stable_images() {
    local tag="fw-prod-$(date +%Y%m%d)"
    log "🏷️ Tagging stable images as $tag"
    
    # Get current running images and tag them as stable
    local images=$(docker ps --format "table {{.Image}}" | grep -v "IMAGE" | sort -u)
    
    while IFS= read -r image; do
        if [[ -n "$image" && "$image" != "IMAGE" ]]; then
            local stable_tag="${image%:*}:$tag"
            docker tag "$image" "$stable_tag"
            log "✅ Tagged $image as $stable_tag"
            
            # Push to registry if configured
            if [[ -n "${DOCKER_REGISTRY:-}" ]]; then
                docker push "$stable_tag" || log "⚠️ Failed to push $stable_tag to registry"
            fi
        fi
    done <<< "$images"
}

# Main monitoring function
main() {
    log "🚀 Starting Fail-Safe Monitoring and Validation"
    
    # Collect baseline metrics
    local health_score=$(collect_metrics)
    local container_score=$(check_container_status)
    
    log "📈 Current Health Score: $health_score%"
    log "🐳 Container Health Score: $container_score%"
    
    # Check if we need to rollback
    local needs_rollback=false
    
    if [ "$health_score" -lt "$PERFORMANCE_THRESHOLD" ]; then
        log "❌ Health score ($health_score%) below threshold ($PERFORMANCE_THRESHOLD%)"
        needs_rollback=true
    fi
    
    if [ "$container_score" -lt "$PERFORMANCE_THRESHOLD" ]; then
        log "❌ Container health ($container_score%) below threshold ($PERFORMANCE_THRESHOLD%)"
        needs_rollback=true
    fi
    
    # Additional error rate checks (if available)
    if command -v curl >/dev/null 2>&1; then
        local error_rate_check=$(curl -s "http://localhost:4000/api/metrics/error-rate" 2>/dev/null || echo "0")
        if [[ "$error_rate_check" =~ ^[0-9.]+$ ]] && (( $(echo "$error_rate_check > $ERROR_THRESHOLD" | bc -l) )); then
            log "❌ Error rate ($error_rate_check%) above threshold ($ERROR_THRESHOLD%)"
            needs_rollback=true
        fi
    fi
    
    if [ "$needs_rollback" = true ]; then
        trigger_rollback
        exit $?
    else
        log "✅ System is healthy. Tagging stable images..."
        tag_stable_images
        log "🎉 Validation completed successfully!"
    fi
}

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Run main function
main "$@"
