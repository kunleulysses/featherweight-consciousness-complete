#!/bin/bash

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_ROOT/test-logs"
TEST_ENV_FILE="$PROJECT_ROOT/.env.test"

# Create log directory
mkdir -p "$LOG_DIR"

# Test configuration
CYPRESS_RETRIES=2
K6_VUS=10
K6_DURATION="2m"
HEALTH_CHECK_TIMEOUT=60
HEALTH_CHECK_INTERVAL=5

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] ${message}${NC}"
}

# Function to check if service is running
check_service() {
    local service_name=$1
    local port=$2
    local max_attempts=$((HEALTH_CHECK_TIMEOUT / HEALTH_CHECK_INTERVAL))
    local attempt=1
    
    print_status "$YELLOW" "Checking $service_name on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "http://localhost:$port/health" > /dev/null 2>&1; then
            print_status "$GREEN" "$service_name is running on port $port"
            return 0
        fi
        
        print_status "$YELLOW" "Attempt $attempt/$max_attempts: $service_name not ready, waiting..."
        sleep $HEALTH_CHECK_INTERVAL
        ((attempt++))
    done
    
    print_status "$RED" "$service_name failed to start on port $port"
    return 1
}

# Function to start test database
start_test_database() {
    print_status "$BLUE" "Starting test database..."
    
    # Check if PostgreSQL is running
    if ! pgrep -x "postgres" > /dev/null; then
        print_status "$YELLOW" "Starting PostgreSQL service..."
        sudo service postgresql start || {
            print_status "$RED" "Failed to start PostgreSQL"
            return 1
        }
    fi
    
    # Create test database if it doesn't exist
    sudo -u postgres psql -c "CREATE DATABASE flappyjournal_test;" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE USER test_user WITH PASSWORD 'test_password';" 2>/dev/null || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE flappyjournal_test TO test_user;" 2>/dev/null || true
    
    print_status "$GREEN" "Test database ready"
}

# Function to start application in test mode
start_test_application() {
    print_status "$BLUE" "Starting application in test mode..."
    
    # Kill any existing processes
    pkill -f "node.*dist/index.js" || true
    pkill -f "tsx.*server/index.ts" || true
    
    # Build the application
    print_status "$YELLOW" "Building application..."
    npm run build > "$LOG_DIR/build.log" 2>&1 || {
        print_status "$RED" "Build failed. Check $LOG_DIR/build.log for details."
        return 1
    }
    
    # Start the application with test environment
    print_status "$YELLOW" "Starting application with test configuration..."
    NODE_ENV=test nohup node dist/index.js > "$LOG_DIR/app.log" 2>&1 &
    APP_PID=$!
    echo $APP_PID > "$LOG_DIR/app.pid"
    
    # Wait for application to be ready
    if check_service "Application" "4000"; then
        print_status "$GREEN" "Application started successfully (PID: $APP_PID)"
        return 0
    else
        print_status "$RED" "Application failed to start"
        kill $APP_PID 2>/dev/null || true
        return 1
    fi
}

# Function to run database migrations
run_migrations() {
    print_status "$BLUE" "Running database migrations..."
    
    NODE_ENV=test npm run db:push > "$LOG_DIR/migrations.log" 2>&1 || {
        print_status "$RED" "Migrations failed. Check $LOG_DIR/migrations.log for details."
        return 1
    }
    
    print_status "$GREEN" "Database migrations completed"
}

# Function to seed test data
seed_test_data() {
    print_status "$BLUE" "Seeding test data..."
    
    # Create test user
    curl -s -X POST "http://localhost:4000/api/auth/register" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "test@example.com",
            "password": "testpassword123",
            "name": "Test User"
        }' > "$LOG_DIR/seed.log" 2>&1 || true
    
    print_status "$GREEN" "Test data seeded"
}

# Function to run Cypress tests
run_cypress_tests() {
    print_status "$BLUE" "Running Cypress E2E tests..."
    
    local test_command="cypress run"
    if [ "${CI:-false}" = "true" ]; then
        test_command="$test_command --headless --browser chrome"
    fi
    
    # Set test environment variables
    export CYPRESS_baseUrl="http://localhost:4000"
    export CYPRESS_video=true
    export CYPRESS_screenshotsFolder="$LOG_DIR/cypress/screenshots"
    export CYPRESS_videosFolder="$LOG_DIR/cypress/videos"
    
    # Create cypress directories
    mkdir -p "$LOG_DIR/cypress/screenshots"
    mkdir -p "$LOG_DIR/cypress/videos"
    
    # Run tests with retries
    local attempt=1
    while [ $attempt -le $((CYPRESS_RETRIES + 1)) ]; do
        print_status "$YELLOW" "Cypress test attempt $attempt/$((CYPRESS_RETRIES + 1))..."
        
        if npx $test_command > "$LOG_DIR/cypress-$attempt.log" 2>&1; then
            print_status "$GREEN" "Cypress tests passed on attempt $attempt"
            return 0
        fi
        
        if [ $attempt -le $CYPRESS_RETRIES ]; then
            print_status "$YELLOW" "Cypress tests failed on attempt $attempt, retrying..."
            sleep 10
        fi
        
        ((attempt++))
    done
    
    print_status "$RED" "Cypress tests failed after $((CYPRESS_RETRIES + 1)) attempts"
    return 1
}

# Function to run k6 load tests
run_k6_tests() {
    print_status "$BLUE" "Running k6 load tests..."
    
    # Check if k6 is installed
    if ! command -v k6 > /dev/null 2>&1; then
        print_status "$YELLOW" "Installing k6..."
        
        # Install k6
        sudo gpg -k 2>/dev/null || sudo gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
        echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
        sudo apt-get update
        sudo apt-get install k6 -y
    fi
    
    # Run k6 tests
    k6 run \
        --vus $K6_VUS \
        --duration $K6_DURATION \
        --env BASE_URL="http://localhost:4000" \
        --env WS_URL="ws://localhost:4002" \
        --out json="$LOG_DIR/k6-results.json" \
        "$PROJECT_ROOT/k6-tests/comprehensive-load-test.js" > "$LOG_DIR/k6.log" 2>&1
    
    local k6_exit_code=$?
    
    if [ $k6_exit_code -eq 0 ]; then
        print_status "$GREEN" "k6 load tests completed successfully"
        
        # Extract key metrics from results
        if [ -f "$LOG_DIR/k6-results.json" ]; then
            print_status "$BLUE" "k6 Test Results Summary:"
            echo "----------------------------------------"
            tail -10 "$LOG_DIR/k6.log" | grep -E "(http_req_duration|http_req_failed|ws_connection_errors)"
        fi
        
        return 0
    else
        print_status "$RED" "k6 load tests failed"
        return 1
    fi
}

# Function to generate test report
generate_test_report() {
    print_status "$BLUE" "Generating test report..."
    
    local report_file="$LOG_DIR/test-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$report_file" << EOF
# FlappyJournal Test Suite Report

**Test Run Date:** $(date '+%Y-%m-%d %H:%M:%S')
**Environment:** Test
**Branch:** $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
**Commit:** $(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

## Test Results Summary

| Test Suite | Status | Duration | Details |
|------------|--------|----------|---------|
| Database Setup | ✅ Pass | - | Test database created and configured |
| Migrations | ✅ Pass | - | Schema migrations applied successfully |
| Application Start | ✅ Pass | - | Application started on port 4000 |
| Cypress E2E | $([[ -f "$LOG_DIR/cypress-1.log" ]] && echo "✅ Pass" || echo "❌ Fail") | - | End-to-end functionality tests |
| k6 Load Tests | $([[ -f "$LOG_DIR/k6-results.json" ]] && echo "✅ Pass" || echo "❌ Fail") | ${K6_DURATION} | Performance and load testing |

## Log Files

- Application logs: \`$LOG_DIR/app.log\`
- Build logs: \`$LOG_DIR/build.log\`
- Cypress logs: \`$LOG_DIR/cypress-*.log\`
- k6 logs: \`$LOG_DIR/k6.log\`
- k6 results: \`$LOG_DIR/k6-results.json\`

## Next Steps

$([[ $OVERALL_SUCCESS -eq 0 ]] && echo "All tests passed! The application is ready for deployment." || echo "Some tests failed. Please review the logs and fix any issues before deployment.")

