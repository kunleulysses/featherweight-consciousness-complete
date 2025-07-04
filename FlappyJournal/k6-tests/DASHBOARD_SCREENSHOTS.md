# Grafana Dashboard Screenshots Guide

This document describes the key dashboard panels and what they show when monitoring k6 load tests.

## 📊 Dashboard Overview

The FlappyJournal SLO Testing Dashboard provides real-time monitoring of:
- Authentication latency SLOs
- Upload success rate tracking
- WebSocket performance metrics
- Loop Hz performance monitoring
- Database connection health
- Overall system performance

## 🖼️ Dashboard Panel Screenshots

### 1. Auth Latency SLO Panel
**Panel ID**: 1
**Type**: Stat Panel
**Location**: Top-left

**What it shows:**
- 95th percentile auth latency
- 99th percentile auth latency
- Color-coded thresholds:
  - Green: < 1.0s (healthy)
  - Yellow: 1.0-2.0s (warning)
  - Red: > 2.0s (critical)

**Expected Values During Test:**
- 95th percentile: ~500ms
- 99th percentile: ~1.2s
- Status: Green (healthy)

### 2. Upload Success Rate SLO Panel
**Panel ID**: 2
**Type**: Stat Panel
**Location**: Top-right

**What it shows:**
- Percentage of successful uploads
- Non-4xx/5xx response rate
- Color-coded success thresholds:
  - Green: > 99% (healthy)
  - Yellow: 95-99% (warning)
  - Red: < 95% (critical)

**Expected Values During Test:**
- Success rate: 99.9%+
- Status: Green (healthy)

### 3. WebSocket Messages/Second Panel
**Panel ID**: 3
**Type**: Time Series Graph
**Location**: Middle-left

**What it shows:**
- Real-time WebSocket message throughput
- Messages per second over time
- Connection establishment rate
- Message delivery latency

**Expected Values During Test:**
- Message rate: 1000-5000 msg/s
- Steady throughput during 5-minute test
- Low latency spikes

### 4. Loop Hz Performance Panel
**Panel ID**: 4
**Type**: Gauge
**Location**: Middle-right

**What it shows:**
- Current Hz reading from /metrics endpoint
- Average Hz over time window
- Target threshold: > 95 Hz
- Color-coded performance:
  - Green: > 95 Hz (passing)
  - Yellow: 90-95 Hz (warning)
  - Red: < 90 Hz (failing)

**Expected Values During Test:**
- Current Hz: ~100 Hz
- Average Hz: > 95 Hz
- Status: Green (passing threshold)

### 5. Database Pool Saturation Panel
**Panel ID**: 5
**Type**: Time Series Graph
**Location**: Bottom-left

**What it shows:**
- Active database connections
- Connection pool usage percentage
- Connection wait times
- Pool saturation over time

**Expected Values During Test:**
- Pool usage: 60-80%
- No connection timeouts
- Stable connection count

### 6. Alertmanager Firing Alerts Panel
**Panel ID**: 6
**Type**: Alert List
**Location**: Bottom-right

**What it shows:**
- Currently firing alerts
- Alert severity levels
- Alert timestamps
- Alert resolution status

**Expected Values During Test:**
- Firing alerts: 0
- No critical alerts
- System stable

## 📈 Time Series Graphs

### K6 Virtual Users Over Time
Shows the ramp-up pattern:
- 0-30s: 0 → 250 VUs
- 30s-1m: 250 → 500 VUs
- 1m-2m: 500 → 1000 VUs
- 2m-7m: 1000 VUs (steady state)
- 7m-7m30s: 1000 → 0 VUs (ramp down)

### WebSocket Connections
Shows connection health:
- Connection attempts per second
- Successful connections
- Connection failures
- Connection duration

### HTTP Request Duration
Shows API performance:
- Average response time
- 95th percentile response time
- 99th percentile response time
- Request rate over time

### Error Rate Over Time
Shows system stability:
- Error rate percentage
- Error types breakdown
- Error count over time
- Target threshold: < 1%

## 🎯 SLO Compliance Visualization

### Success Indicators (Green)
- Auth latency < 1.0s
- Upload success rate > 99%
- WebSocket messages flowing
- Hz performance > 95
- Database pool healthy
- No firing alerts

### Warning Indicators (Yellow)
- Auth latency 1.0-2.0s
- Upload success rate 95-99%
- WebSocket intermittent issues
- Hz performance 90-95
- Database pool 80-90% usage
- Low-priority alerts

### Critical Indicators (Red)
- Auth latency > 2.0s
- Upload success rate < 95%
- WebSocket connection failures
- Hz performance < 90
- Database pool saturated
- Critical alerts firing

## 🔍 How to Interpret Dashboard During Test

### Pre-Test (Monitoring Setup)
- All panels showing "No data"
- Services starting up
- Connections being established

### Ramp-Up Phase (0-2 minutes)
- Gradual increase in metrics
- Virtual users scaling up
- System warming up

### Steady State (2-7 minutes)
- Stable metrics at target levels
- 1000 VUs sustained
- SLO thresholds met
- Hz performance stable

### Ramp-Down Phase (7-7.5 minutes)
- Virtual users decreasing
- System load reducing
- Metrics stabilizing

### Post-Test Analysis
- Final metrics summary
- SLO compliance results
- Performance trends
- Any issues identified

## 📊 Dashboard Access Information

- **URL**: http://localhost:3001
- **Username**: admin
- **Password**: admin
- **Direct Dashboard**: http://localhost:3001/d/testing/flappyjournal-slo-testing-dashboard
- **Refresh Rate**: 5 seconds
- **Time Range**: Last 30 minutes

## 🖼️ Screenshot Locations

When taking screenshots for documentation, capture these key views:

1. **Full Dashboard Overview** - Shows all panels at once
2. **SLO Status Panel** - Close-up of Auth Latency and Upload Success Rate
3. **Performance Metrics** - WebSocket and Hz performance panels
4. **Time Series Analysis** - Request duration and error rate graphs
5. **System Health** - Database pool and alerts panels

## 📸 Best Practices for Screenshots

1. **Timing**: Take screenshots during steady-state phase (2-7 minutes)
2. **Resolution**: Use high resolution for clarity
3. **Annotations**: Highlight key metrics and thresholds
4. **Context**: Include timestamp and test configuration
5. **Comparison**: Show before/during/after states

## 🔧 Troubleshooting Dashboard Issues

### Dashboard Not Loading
```bash
# Check Grafana status
curl http://localhost:3001/api/health

# Restart Grafana
docker-compose restart grafana
```

### No Data in Panels
```bash
# Check Prometheus connection
curl http://localhost:9090/-/healthy

# Verify k6 metrics export
docker-compose logs k6-websocket-streaming | grep prometheus
```

### Incorrect Metrics
```bash
# Verify metrics endpoint
curl http://localhost:4000/metrics

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets
```

This dashboard provides comprehensive monitoring of the k6 load testing and SLO compliance, enabling real-time visibility into system performance and test progress.
