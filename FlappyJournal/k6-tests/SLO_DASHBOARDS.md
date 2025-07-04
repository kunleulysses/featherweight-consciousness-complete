# FlappyJournal SLO Testing Dashboards

This document describes the Prometheus/Grafana SLO dashboards for FlappyJournal testing environment.

## Overview

The SLO (Service Level Objective) dashboards provide comprehensive monitoring of key performance metrics during load testing. All dashboards are automatically loaded through the Grafana provisioning system.

## Dashboard Location

- **File**: `dashboards/testing.json`
- **URL**: http://localhost:3001/d/testing/flappyjournal-slo-testing-dashboard
- **Auto-load**: Yes, via Grafana container provisioning

## SLO Metrics Monitored

### 1. Auth Latency SLO
- **Metric**: `http_request_duration_seconds`
- **Query**: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{job="featherweight-api", endpoint=~".*auth.*"}[5m])) by (le))`
- **Threshold**: 
  - Green: < 1.0s
  - Yellow: 1.0s - 2.0s
  - Red: > 2.0s
- **SLO**: 95th percentile auth requests under 2 seconds

### 2. Upload Success Rate SLO
- **Metric**: `http_requests_total`
- **Query**: `sum(rate(http_requests_total{job="featherweight-api", endpoint=~".*upload.*", code!~"4.*|5.*"}[5m])) / sum(rate(http_requests_total{job="featherweight-api", endpoint=~".*upload.*"}[5m])) * 100`
- **Threshold**:
  - Red: < 95%
  - Yellow: 95% - 99%
  - Green: > 99%
- **SLO**: 99% upload success rate

### 3. WebSocket Messages/Second
- **Metric**: `websocket_messages_total`
- **Query**: `rate(websocket_messages_total{job="chat-orchestrator"}[1m])`
- **Unit**: requests per second
- **SLO**: Monitor real-time message throughput

### 4. Loop Hz Performance
- **Metric**: Custom k6 metric `hz_avg`
- **Query**: `avg(hz_avg)`
- **Threshold**:
  - Red: < 90 Hz
  - Yellow: 90-95 Hz
  - Green: > 95 Hz
- **SLO**: Maintain > 95 Hz average performance

### 5. Database Pool Saturation
- **Metric**: `db_pool_active_connections`, `db_pool_max_connections`
- **Query**: `db_pool_active_connections / db_pool_max_connections * 100`
- **Threshold**:
  - Green: < 70%
  - Yellow: 70% - 90%
  - Red: > 90%
- **SLO**: Keep DB pool utilization under 90%

### 6. Alertmanager Firing Alerts
- **Metric**: `ALERTS{alertstate="firing"}`
- **Query**: `ALERTS{alertstate="firing"}`
- **Display**: Table format showing active alerts
- **SLO**: Monitor critical system alerts

## Additional Monitoring Panels

### 7. K6 Test Metrics Overview
- HTTP Requests/second
- Checks/second
- Virtual Users count

### 8. Error Rate SLO
- **Threshold**: < 5% error rate
- **Query**: `sum(rate(http_requests_total{code=~"4.*|5.*"}[5m])) / sum(rate(http_requests_total[5m])) * 100`

### 9. Response Time P95
- **Threshold**: < 2.0s
- **Query**: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))`

### 10. WebSocket Connection Errors
- **Threshold**: < 10 errors
- **Query**: `sum(ws_connection_errors)`

## Data Sources

### Prometheus Configuration
- **Remote Write**: Enabled for k6 metrics
- **Scrape Targets**:
  - `featherweight-api`: Port 4000
  - `chat-orchestrator`: Port 8080
  - `k6`: Port 6565 (when running)

### K6 Remote Write
- **URL**: `http://prometheus:9090/api/v1/write`
- **Push Interval**: 5s
- **Metrics Retention**: Custom tags preserved

## Alerting Rules

The system includes alerting rules for:
- High Auth Latency (> 2s)
- Low Upload Success Rate (< 95%)
- Low Loop Hz (< 90)
- High DB Pool Saturation (> 90%)
- High Error Rate (> 5%)
- WebSocket Connection Errors (> 10)

## Usage

### Starting the Monitoring Stack

```bash
# Start Prometheus and Grafana
./run-slo-testing.sh start-monitoring

# Access Grafana
open http://localhost:3001
# Login: admin/admin
```

### Running Tests with SLO Monitoring

```bash
# Comprehensive load test
./run-slo-testing.sh run-comprehensive

# WebSocket streaming test
./run-slo-testing.sh run-websocket

# Health check
./run-slo-testing.sh run-health
```

### Accessing Dashboards

```bash
# Show dashboard URLs
./run-slo-testing.sh dashboard-url

# Show Prometheus URL
./run-slo-testing.sh prometheus-url
```

## Dashboard Auto-Loading

The dashboard is automatically loaded through:
1. **Grafana Provisioning**: `grafana-provisioning/dashboards/dashboards.yml`
2. **Volume Mount**: `./dashboards:/etc/grafana/provisioning/dashboards:ro`
3. **Dashboard JSON**: `dashboards/testing.json`

No manual dashboard import is required - the dashboard is available immediately when Grafana starts.

## Customization

To modify the dashboard:
1. Edit `dashboards/testing.json`
2. Restart Grafana: `docker-compose restart grafana`
3. Changes are automatically applied

## Troubleshooting

### Dashboard Not Loading
- Check Grafana logs: `docker-compose logs grafana`
- Verify provisioning config: `grafana-provisioning/dashboards/dashboards.yml`
- Ensure dashboard JSON is valid

### Missing Metrics
- Check Prometheus targets: http://localhost:9090/targets
- Verify k6 remote-write configuration
- Check application metrics endpoints

### Remote Write Issues
- Ensure Prometheus has `--enable-feature=remote-write-receiver`
- Check k6 environment variable: `K6_PROMETHEUS_RW_SERVER_URL`
- Verify network connectivity between containers
