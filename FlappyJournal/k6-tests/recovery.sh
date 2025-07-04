#!/bin/bash
# recovery.sh - SSH disconnection recovery script

set -e

echo "🔄 Starting SSH disconnection recovery..."

# Check if monitoring is running
echo "📊 Checking monitoring services..."
if ! curl -s http://localhost:9090/-/healthy > /dev/null; then
    echo "❌ Prometheus not healthy, restarting monitoring stack..."
    ./run-slo-testing.sh start-monitoring
    sleep 10
else
    echo "✅ Prometheus is healthy"
fi

if ! curl -s http://localhost:3001/api/health > /dev/null; then
    echo "❌ Grafana not healthy, restarting monitoring stack..."
    ./run-slo-testing.sh start-monitoring
    sleep 10
else
    echo "✅ Grafana is healthy"
fi

# Check if test is still running
echo "🧪 Checking test status..."
if ! docker ps | grep k6 > /dev/null; then
    echo "❌ Test not running, checking last results..."
    
    # Show last test results if available
    if docker-compose logs k6-websocket-streaming 2>/dev/null | tail -20; then
        echo "📊 Last test results shown above"
    else
        echo "ℹ️  No previous test results found"
    fi
    
    echo "🔄 Would you like to restart the test? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "🧪 Restarting WebSocket streaming test..."
        ./run-slo-testing.sh run-websocket
    fi
else
    echo "✅ Test is currently running"
    echo "📊 Showing recent test logs..."
    docker-compose logs --tail=10 k6-websocket-streaming
fi

echo ""
echo "✅ Recovery completed!"
echo "📊 Grafana Dashboard: http://localhost:3001"
echo "📈 Prometheus: http://localhost:9090"
echo "🎯 SLO Dashboard: http://localhost:3001/d/testing/flappyjournal-slo-testing-dashboard"
