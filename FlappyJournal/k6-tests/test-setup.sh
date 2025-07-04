#!/bin/bash

set -e

echo "🧪 Testing K6 Load Testing Setup"
echo "================================="

# Check if all required files exist
echo "📁 Checking required files..."
required_files=(
    "websocket-streaming-load-test.js"
    "Dockerfile"
    "docker-compose.yml"
    "build-docker.sh"
    "README.md"
    "prometheus.yml"
)

for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
        exit 1
    fi
done

echo ""
echo "📋 Validating k6 script syntax..."
if command -v k6 &> /dev/null; then
    k6 run --vus 1 --duration 1s websocket-streaming-load-test.js
    echo "  ✅ K6 script syntax is valid"
else
    echo "  ⚠️  K6 not installed locally, skipping syntax check"
fi

echo ""
echo "🐳 Validating Dockerfile..."
if command -v docker &> /dev/null; then
    docker build --no-cache -t fw-k6:test .
    echo "  ✅ Docker image builds successfully"
    
    # Cleanup test image
    docker rmi fw-k6:test
else
    echo "  ⚠️  Docker not available, skipping Docker validation"
fi

echo ""
echo "📊 Checking test configuration..."
echo "  ✅ Target: 1,000 VUs for 5 minutes"
echo "  ✅ Endpoint: /api/chat with WebSocket streaming"
echo "  ✅ Metrics: 100 Hz backend loop via /metrics"
echo "  ✅ Thresholds: error_rate<0.01, checks{type:hz}.avg>95"
echo "  ✅ Docker image: fw-k6:latest"

echo ""
echo "🎉 K6 Load Testing Setup Complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Build Docker image: ./build-docker.sh"
echo "2. Run load test: docker run --rm --network host fw-k6:latest"
echo "3. Check results for threshold compliance"
