#!/bin/bash

# FlappyJournal SLO Testing Script
# This script manages the test environment with Prometheus/Grafana SLO dashboards

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

show_help() {
    echo "FlappyJournal SLO Testing Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "    start-monitoring    Start Prometheus and Grafana with SLO dashboards"
    echo "    stop-monitoring     Stop monitoring services"
    echo "    run-comprehensive   Run comprehensive load test with SLO monitoring"
    echo "    run-websocket       Run WebSocket streaming test with SLO monitoring"
    echo "    run-health          Run health check test"
    echo "    dashboard-url       Show Grafana dashboard URL"
    echo "    prometheus-url      Show Prometheus URL"
    echo "    help               Show this help message"
    echo ""
    echo "Environment Setup:"
    echo "    - Prometheus: http://localhost:9090"
    echo "    - Grafana: http://localhost:3001 (admin/admin)"
    echo "    - SLO Dashboard: Automatically loaded at /dashboards/testing.json"
    echo ""
    echo "SLO Metrics Monitored:"
    echo "    - Auth latency (95th percentile)"
    echo "    - Upload success rate (%)"
    echo "    - WebSocket messages/second"
    echo "    - Loop Hz performance"
    echo "    - Database pool saturation"
    echo "    - Alertmanager firing alerts"
    echo ""
}

start_monitoring() {
    echo "🚀 Starting SLO monitoring services..."
    docker-compose --profile monitoring up -d
    echo "✅ Monitoring services started"
    echo "📊 Grafana: http://localhost:3001 (admin/admin)"
    echo "📈 Prometheus: http://localhost:9090"
    echo "🎯 SLO Dashboard will be automatically loaded"
}

stop_monitoring() {
    echo "🛑 Stopping monitoring services..."
    docker-compose --profile monitoring down
    echo "✅ Monitoring services stopped"
}

run_comprehensive() {
    echo "🧪 Running comprehensive load test with SLO monitoring..."
    start_monitoring
    sleep 5
    docker-compose --profile comprehensive up --build
    echo "✅ Comprehensive test completed"
}

run_websocket() {
    echo "🧪 Running WebSocket streaming test with SLO monitoring..."
    start_monitoring
    sleep 5
    docker-compose --profile load-test up --build
    echo "✅ WebSocket streaming test completed"
}

run_health() {
    echo "🧪 Running health check test..."
    docker-compose --profile health up --build
    echo "✅ Health check completed"
}

dashboard_url() {
    echo "📊 Grafana Dashboard: http://localhost:3001"
    echo "🎯 SLO Dashboard: http://localhost:3001/d/testing/flappyjournal-slo-testing-dashboard"
}

prometheus_url() {
    echo "📈 Prometheus: http://localhost:9090"
}

case "${1:-help}" in
    start-monitoring)
        start_monitoring
        ;;
    stop-monitoring)
        stop_monitoring
        ;;
    run-comprehensive)
        run_comprehensive
        ;;
    run-websocket)
        run_websocket
        ;;
    run-health)
        run_health
        ;;
    dashboard-url)
        dashboard_url
        ;;
    prometheus-url)
        prometheus_url
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        show_help
        exit 1
        ;;
esac
