#!/bin/bash

echo "🚀 Starting Featherweight Monitoring Stack..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Navigate to monitoring directory
cd "$(dirname "$0")"

# Build consciousness exporter
echo "🔧 Building consciousness exporter..."
cd exporters
npm install
cd ..

# Start the monitoring stack
echo "📊 Starting Prometheus, Grafana, and exporters..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🏥 Checking service health..."

services=("prometheus:9090" "grafana:3000" "alertmanager:9093" "node-exporter:9100" "postgres-exporter:9187")

for service in "${services[@]}"; do
    if docker-compose ps | grep -q "${service%%:*}.*Up"; then
        echo "✅ ${service%%:*} is running"
    else
        echo "❌ ${service%%:*} failed to start"
    fi
done

echo ""
echo "🎉 Monitoring stack is ready!"
echo ""
echo "📊 Access URLs:"
echo "   Prometheus: http://localhost:9090"
echo "   Grafana:    http://localhost:3000 (admin/admin123)"
echo "   Alert Mgr:  http://localhost:9093"
echo ""
echo "📈 Key Dashboards:"
echo "   Consciousness SLO: http://localhost:3000/d/consciousness-slo"
echo ""
echo "🔧 To stop: docker-compose down"
echo "📜 To view logs: docker-compose logs -f [service-name]"
