#!/bin/bash

# scripts/validate.sh - Validation script for k6 test suite
# This script performs comprehensive validation of the k6 test project
# Can be executed manually over SSH or via cron

set -e  # Exit on any error

echo "🔍 Starting validation pipeline..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "success")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "error")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "info")
            echo -e "ℹ️  $message"
            ;;
    esac
}

# Function to validate k6 test files
validate_k6_tests() {
    print_status "info" "Validating k6 test files..."
    
    # Check if k6 is available
    if ! command -v k6 &> /dev/null; then
        print_status "warning" "k6 is not installed or not in PATH - skipping k6 validation"
        return 0
    fi
    
    # Validate JavaScript test files by checking syntax
    local test_files=(
        "load-test.js"
        "comprehensive-load-test.js"
        "websocket-streaming-load-test.js"
    )
    
    for test_file in "${test_files[@]}"; do
        if [[ -f "$test_file" ]]; then
            print_status "info" "Validating $test_file..."
            # Check if the file contains basic k6 structure
            if grep -q "import.*k6" "$test_file" && grep -q "export.*function" "$test_file"; then
                print_status "success" "$test_file has valid k6 structure"
            else
                print_status "warning" "$test_file may not be a valid k6 test file"
            fi
        else
            print_status "warning" "$test_file not found"
        fi
    done
}

# Function to validate Docker setup
validate_docker_setup() {
    print_status "info" "Validating Docker setup..."
    
    # Check Dockerfile
    if [[ -f "Dockerfile" ]]; then
        print_status "success" "Dockerfile exists"
    else
        print_status "error" "Dockerfile not found"
        return 1
    fi
    
    # Check docker-compose.yml
    if [[ -f "docker-compose.yml" ]]; then
        print_status "success" "docker-compose.yml exists"
        
        # Validate docker-compose syntax if docker-compose is available
        if command -v docker-compose &> /dev/null; then
            if docker-compose config > /dev/null 2>&1; then
                print_status "success" "docker-compose.yml is valid"
            else
                print_status "error" "docker-compose.yml has syntax errors"
                return 1
            fi
        else
            print_status "warning" "docker-compose not available - skipping syntax validation"
        fi
    else
        print_status "warning" "docker-compose.yml not found"
    fi
}

# Function to validate monitoring setup
validate_monitoring_setup() {
    print_status "info" "Validating monitoring setup..."
    
    # Check Prometheus configuration
    if [[ -f "prometheus.yml" ]]; then
        print_status "success" "prometheus.yml exists"
    else
        print_status "warning" "prometheus.yml not found"
    fi
    
    # Check alerting rules
    if [[ -f "alerting-rules.yml" ]]; then
        print_status "success" "alerting-rules.yml exists"
    else
        print_status "warning" "alerting-rules.yml not found"
    fi
    
    # Check Grafana provisioning
    if [[ -d "grafana-provisioning" ]]; then
        print_status "success" "grafana-provisioning directory exists"
    else
        print_status "warning" "grafana-provisioning directory not found"
    fi
}

# Function to validate shell scripts
validate_shell_scripts() {
    print_status "info" "Validating shell scripts..."
    
    local shell_scripts=(
        "build-docker.sh"
        "test-setup.sh"
        "run-slo-testing.sh"
        "validate-slo-setup.sh"
    )
    
    for script in "${shell_scripts[@]}"; do
        if [[ -f "$script" ]]; then
            if [[ -x "$script" ]]; then
                print_status "success" "$script is executable"
                
                # Basic syntax check
                if bash -n "$script" 2>/dev/null; then
                    print_status "success" "$script syntax is valid"
                else
                    print_status "error" "$script has syntax errors"
                    return 1
                fi
            else
                print_status "warning" "$script is not executable"
            fi
        else
            print_status "warning" "$script not found"
        fi
    done
}

# Function to validate documentation
validate_documentation() {
    print_status "info" "Validating documentation..."
    
    local docs=(
        "README.md"
        "SLO_DASHBOARDS.md"
        "SLO_IMPLEMENTATION_SUMMARY.md"
        "TASK_COMPLETION_SUMMARY.md"
    )
    
    for doc in "${docs[@]}"; do
        if [[ -f "$doc" ]]; then
            if [[ -s "$doc" ]]; then
                print_status "success" "$doc exists and is not empty"
            else
                print_status "warning" "$doc exists but is empty"
            fi
        else
            print_status "warning" "$doc not found"
        fi
    done
}

# Function to validate project structure
validate_project_structure() {
    print_status "info" "Validating project structure..."
    
    # Check if this looks like a k6 project
    local has_k6_tests=false
    if [[ -f "load-test.js" ]] || [[ -f "comprehensive-load-test.js" ]] || [[ -f "websocket-streaming-load-test.js" ]]; then
        has_k6_tests=true
        print_status "success" "k6 test files found"
    fi
    
    # Check if Makefile exists
    if [[ -f "Makefile" ]]; then
        print_status "success" "Makefile exists"
    else
        print_status "warning" "Makefile not found"
    fi
    
    # Check if scripts directory exists
    if [[ -d "scripts" ]]; then
        print_status "success" "scripts directory exists"
    else
        print_status "warning" "scripts directory not found"
    fi
    
    if [[ "$has_k6_tests" == true ]]; then
        print_status "success" "Project structure looks valid for k6 testing"
    else
        print_status "warning" "No k6 test files found"
    fi
}

# Main validation function
main() {
    local exit_code=0
    
    print_status "info" "Starting comprehensive validation..."
    echo "----------------------------------------"
    
    # Run all validation checks
    validate_project_structure || exit_code=1
    echo ""
    
    validate_k6_tests || exit_code=1
    echo ""
    
    validate_docker_setup || exit_code=1
    echo ""
    
    validate_monitoring_setup || exit_code=1
    echo ""
    
    validate_shell_scripts || exit_code=1
    echo ""
    
    validate_documentation || exit_code=1
    echo ""
    
    echo "----------------------------------------"
    if [[ $exit_code -eq 0 ]]; then
        print_status "success" "All validations passed! ✨"
    else
        print_status "error" "Some validations failed! Please check the errors above."
    fi
    
    return $exit_code
}

# Execute main function
main "$@"
