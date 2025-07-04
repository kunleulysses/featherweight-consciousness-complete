#!/bin/bash

set -e

echo "🚀 Setting up Featherweight Authentication & API Gateway"
echo "======================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Install additional dependencies
print_status "Installing authentication dependencies..."
npm install jsonwebtoken@^9.0.2 jwks-rsa@^3.1.0 bcryptjs@^2.4.3 speakeasy@^2.0.0 qrcode@^1.5.3
npm install --save-dev @types/jsonwebtoken@^9.0.5 @types/bcryptjs@^2.4.6 @types/speakeasy@^2.0.10 @types/qrcode@^1.5.5

print_success "Dependencies installed"

# Create environment file if it doesn't exist
if [ ! -f .env.auth ]; then
    print_status "Creating authentication environment file..."
    cp .env.auth.example .env.auth
    print_warning "Please update .env.auth with your configuration before continuing"
    print_warning "Press Enter to continue or Ctrl+C to exit..."
    read -r
fi

# Load environment variables
if [ -f .env.auth ]; then
    export $(cat .env.auth | grep -v '^#' | xargs)
fi

print_status "Starting authentication services..."

# Start Docker services
docker-compose -f docker-compose.auth.yml up -d

print_status "Waiting for services to be ready..."

# Wait for Keycloak to be ready
print_status "Waiting for Keycloak to start..."
max_attempts=60
attempt=0
while ! curl -f http://localhost:8080/health/ready > /dev/null 2>&1; do
    if [ $attempt -ge $max_attempts ]; then
        print_error "Keycloak failed to start within expected time"
        exit 1
    fi
    attempt=$((attempt + 1))
    sleep 2
    echo -n "."
done
echo ""
print_success "Keycloak is ready"

# Wait for Kong to be ready
print_status "Waiting for Kong to start..."
attempt=0
while ! curl -f http://localhost:8001/status > /dev/null 2>&1; do
    if [ $attempt -ge $max_attempts ]; then
        print_error "Kong failed to start within expected time"
        exit 1
    fi
    attempt=$((attempt + 1))
    sleep 2
    echo -n "."
done
echo ""
print_success "Kong is ready"

# Initialize Keycloak
print_status "Initializing Keycloak configuration..."
npm run auth:init

# Setup Kong API Gateway
print_status "Setting up Kong API Gateway..."
npm run kong:setup

# Run database migrations
print_status "Running database migrations..."
npm run migrate

# Verify setup
print_status "Verifying setup..."

# Check Keycloak
if curl -f http://localhost:8080/realms/featherweight/.well-known/openid_configuration > /dev/null 2>&1; then
    print_success "Keycloak realm configured correctly"
else
    print_warning "Keycloak realm may not be configured correctly"
fi

# Check Kong
if curl -f http://localhost:8001/services > /dev/null 2>&1; then
    print_success "Kong API Gateway is accessible"
else
    print_warning "Kong API Gateway may not be configured correctly"
fi

echo ""
print_success "🎉 Authentication setup completed!"
echo ""
echo "📋 Service URLs:"
echo "   Keycloak Admin Console: http://localhost:8080/admin/"
echo "   Keycloak Account Console: http://localhost:8080/realms/featherweight/account/"
echo "   Kong Admin API: http://localhost:8001"
echo "   Kong Manager: http://localhost:8002"
echo "   API Gateway Proxy: http://localhost:8000"
echo ""
echo "🔑 Default Credentials:"
echo "   Keycloak Admin: admin / ${KEYCLOAK_ADMIN_PASSWORD:-admin-secret-password}"
echo ""
echo "🛣️  API Routes (via Gateway):"
echo "   Application API: http://localhost:8000/api/*"
echo "   Authentication: http://localhost:8000/auth/*"
echo "   Public Routes: http://localhost:8000/public/*"
echo ""
echo "📖 Next Steps:"
echo "   1. Update your frontend to use the new auth endpoints"
echo "   2. Test the authentication flow"
echo "   3. Configure social login providers in Keycloak"
echo "   4. Set up MFA for enhanced security"
echo ""
print_warning "Remember to update your application to use the new authentication system!"
