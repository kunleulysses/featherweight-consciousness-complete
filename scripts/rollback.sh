#!/bin/bash

# Rollback script for featherweight application
# Logs to /var/log/fw-rollback.log

LOG_FILE="/var/log/fw-rollback.log"
RESULTS_FILE="results.json"
DOCKER_COMPOSE_FILE="docker-compose.stable.yml"
PROD_TAG="fw-prod-stable"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Function to check if script is already running (idempotent)
check_lock() {
    local lock_file="/tmp/fw-rollback.lock"
    if [ -f "$lock_file" ]; then
        local pid=$(cat "$lock_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            log_message "Rollback already in progress (PID: $pid). Exiting."
            exit 0
        else
            rm -f "$lock_file"
        fi
    fi
    echo $$ > "$lock_file"
    trap 'rm -f "$lock_file"' EXIT
}

# Function to get previous stable digest
get_previous_digest() {
    # Get the previous digest from Docker registry or local history
    # This assumes we maintain a history of stable digests
    local prev_digest_file="/var/lib/fw-prev-digest"
    if [ -f "$prev_digest_file" ]; then
        cat "$prev_digest_file"
    else
        log_message "ERROR: No previous digest found. Cannot rollback."
        exit 1
    fi
}

# Function to save current digest before deployment
save_current_digest() {
    local current_digest=$(docker inspect --format='{{index .RepoDigests 0}}' "$PROD_TAG" 2>/dev/null || echo "")
    if [ -n "$current_digest" ]; then
        echo "$current_digest" > "/var/lib/fw-prev-digest"
        log_message "Saved current digest: $current_digest"
    fi
}

# Main rollback function
main() {
    log_message "Starting rollback check..."
    
    # Check lock to ensure idempotency
    check_lock
    
    # Check if results.json exists
    if [ ! -f "$RESULTS_FILE" ]; then
        log_message "ERROR: $RESULTS_FILE not found. Cannot determine test status."
        exit 1
    fi
    
    # Check for test failures in results.json
    if jq -e '.checks | to_entries[] | select(.value.fails > 0)' "$RESULTS_FILE" > /dev/null 2>&1; then
        log_message "Test failures detected in $RESULTS_FILE. Initiating rollback..."
        
        # Get previous stable digest
        local prev_digest=$(get_previous_digest)
        if [ -z "$prev_digest" ]; then
            log_message "ERROR: Could not retrieve previous digest."
            exit 1
        fi
        
        log_message "Rolling back to previous digest: $prev_digest"
        
        # Retag to previous digest
        if docker tag "$prev_digest" "$PROD_TAG"; then
            log_message "Successfully retagged $PROD_TAG to $prev_digest"
        else
            log_message "ERROR: Failed to retag $PROD_TAG"
            exit 1
        fi
        
        # Push the rolled-back tag
        if docker push "$PROD_TAG"; then
            log_message "Successfully pushed rolled-back $PROD_TAG"
        else
            log_message "ERROR: Failed to push rolled-back $PROD_TAG"
            exit 1
        fi
        
        # Redeploy using docker stack
        if [ -f "$DOCKER_COMPOSE_FILE" ]; then
            log_message "Redeploying featherweight stack..."
            if docker stack deploy -c "$DOCKER_COMPOSE_FILE" featherweight; then
                log_message "Successfully redeployed featherweight stack"
            else
                log_message "ERROR: Failed to redeploy featherweight stack"
                exit 1
            fi
        else
            log_message "ERROR: $DOCKER_COMPOSE_FILE not found. Cannot redeploy."
            exit 1
        fi
        
        log_message "Rollback completed successfully"
    else
        log_message "No test failures detected. No rollback needed."
    fi
}

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Run main function
main "$@"
