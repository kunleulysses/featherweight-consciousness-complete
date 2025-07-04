#!/bin/bash

# Validation script for SLO Dashboard setup
set -e

echo "🔍 Validating FlappyJournal SLO Dashboard Setup..."

# Check if required files exist
required_files=(
    "dashboards/testing.json"
    "grafana-provisioning/dashboards/dashboards.yml"
    "grafana-provisioning/datasources/prometheus.yml"
    "prometheus.yml"
    "alerting-rules.yml"
    "docker-compose.yml"
)

echo "📁 Checking required files..."
for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Validate JSON syntax
echo "📋 Validating dashboard JSON..."
if python3 -m json.tool dashboards/testing.json > /dev/null 2>&1; then
    echo "✅ Dashboard JSON is valid"
else
    echo "❌ Dashboard JSON is invalid"
    exit 1
fi

# Check docker-compose syntax
echo "🐳 Checking docker-compose configuration..."
if command -v docker-compose >/dev/null 2>&1; then
    if docker-compose config > /dev/null 2>&1; then
        echo "✅ Docker-compose configuration is valid"
    else
        echo "❌ Docker-compose configuration is invalid"
        exit 1
    fi
else
    echo "⚠️  docker-compose not installed, skipping syntax check"
fi

# Count dashboard panels
panel_count=$(grep -o '"id":' dashboards/testing.json | wc -l)
echo "📊 Dashboard contains $panel_count panels"

# Check for required SLO metrics
required_metrics=(
    "Auth Latency SLO"
    "Upload Success Rate SLO"
    "WebSocket Messages/Second"
    "Loop Hz Performance"
    "Database Pool Saturation"
    "Alertmanager Firing Alerts"
)

echo "📈 Checking SLO metric panels..."
for metric in "${required_metrics[@]}"; do
    if grep -q "$metric" dashboards/testing.json; then
        echo "✅ $metric panel found"
    else
        echo "❌ $metric panel missing"
        exit 1
    fi
done

echo ""
echo "🎉 SLO Dashboard setup validation completed successfully!"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: ./run-slo-testing.sh start-monitoring"
echo "   2. Access Grafana: http://localhost:3001 (admin/admin)"
echo "   3. Run tests: ./run-slo-testing.sh run-comprehensive"
echo ""
echo "📚 Documentation: SLO_DASHBOARDS.md"
