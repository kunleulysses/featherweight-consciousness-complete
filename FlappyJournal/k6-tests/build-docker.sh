#!/bin/bash

set -e

echo "🐳 Building fw-k6:latest Docker image..."

# Build the Docker image
docker build -t fw-k6:latest .

echo "✅ Docker image fw-k6:latest built successfully!"

# Show image info
echo "📋 Image information:"
docker images fw-k6:latest

echo ""
echo "🚀 Usage examples:"
echo ""
echo "# Run default WebSocket streaming test (1000 VUs, 5 minutes):"
echo "docker run --rm --network host fw-k6:latest"
echo ""
echo "# Run health check:"
echo "docker run --rm --network host -e TEST_TYPE=health fw-k6:latest"
echo ""
echo "# Run with custom parameters:"
echo "docker run --rm --network host -e VUS=500 -e DURATION=2m fw-k6:latest"
echo ""
echo "# Run comprehensive test:"
echo "docker run --rm --network host -e TEST_TYPE=comprehensive fw-k6:latest"
echo ""
echo "# Run with custom URLs:"
echo "docker run --rm \\"
echo "  -e BASE_URL=http://production-api:4000 \\"
echo "  -e WS_URL=ws://production-chat:8080 \\"
echo "  fw-k6:latest"
