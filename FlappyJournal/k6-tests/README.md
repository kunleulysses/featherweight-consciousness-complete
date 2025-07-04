# K6 Load Testing Suite for Featherweight Chat API

This directory contains k6 load testing scripts specifically designed to test the `/api/chat` WebSocket streaming endpoint with 1,000 virtual users over 5 minutes, while monitoring the 100 Hz backend loop metrics.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Test Scenarios](#test-scenarios)
- [Step-by-Step Usage Instructions](#step-by-step-usage-instructions)
- [Configuration](#configuration)
- [Docker Usage](#docker-usage)
- [Monitoring & Dashboards](#monitoring--dashboards)
- [Rollback Semantics](#rollback-semantics)
- [Troubleshooting](#troubleshooting)
- [SSH Disconnection Recovery](#ssh-disconnection-recovery)
- [Performance Benchmarks](#performance-benchmarks)

## 🚀 Quick Start

```bash
# 1. Start monitoring stack
./run-slo-testing.sh start-monitoring

# 2. Run main load test (1000 VUs, 5 minutes)
./run-slo-testing.sh run-websocket

# 3. View results in Grafana
# Visit: http://localhost:3001 (admin/admin)
```

## 🎯 Test Scenarios

### Primary Test: WebSocket Streaming Load Test
- **File**: `websocket-streaming-load-test.js`
- **Scenario**: 1,000 virtual users for 5 minutes
- **Target**: `/api/chat` with WebSocket streaming
- **Metrics Check**: 100 Hz backend loop via `/metrics`
- **Thresholds**: 
  - `error_rate < 0.01` (< 1% error rate)
  - `checks{type:hz}.avg > 95` (average Hz > 95)

### Additional Tests
- **File**: `comprehensive-load-test.js` - Full application load testing
- **File**: `load-test.js` - General API load testing

## 📖 Step-by-Step Usage Instructions

### Prerequisites Setup

1. **Install Required Tools**
   ```bash
   # Install Docker and Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Install k6 (optional, for local testing)
   # macOS: brew install k6
   # Linux: sudo apt-get update && sudo apt-get install k6
   ```

2. **Prepare Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.test.example .env.test
   
   # Edit configuration as needed
   nano .env.test
   ```

3. **Validate Setup**
   ```bash
   # Run validation script
   ./validate-slo-setup.sh
   
   # Or use Make
   make slo-validate
   ```

### Running Tests

#### Option 1: Using the SLO Testing Script (Recommended)

1. **Start Monitoring Infrastructure**
   ```bash
   ./run-slo-testing.sh start-monitoring
   ```
   
   This will:
   - Start Prometheus on port 9090
   - Start Grafana on port 3001
   - Load SLO dashboards automatically
   - Configure alerting rules

2. **Run Your Chosen Test**
   ```bash
   # Main WebSocket streaming test (1000 VUs, 5 minutes)
   ./run-slo-testing.sh run-websocket
   
   # Comprehensive application test
   ./run-slo-testing.sh run-comprehensive
   
   # Quick health check
   ./run-slo-testing.sh run-health
   ```

3. **Monitor Results**
   ```bash
   # Get dashboard URL
   ./run-slo-testing.sh dashboard-url
   
   # Get Prometheus URL
   ./run-slo-testing.sh prometheus-url
   ```

4. **Stop Monitoring When Done**
   ```bash
   ./run-slo-testing.sh stop-monitoring
   ```

#### Option 2: Using Docker Compose

1. **Start Monitoring Stack**
   ```bash
   docker-compose --profile monitoring up -d
   ```

2. **Run Tests**
   ```bash
   # WebSocket streaming test
   docker-compose --profile load-test up k6-websocket-streaming
   
   # Health check
   docker-compose --profile health up k6-health-check
   
   # Comprehensive test
   docker-compose --profile comprehensive up k6-comprehensive
   ```

3. **Stop Services**
   ```bash
   docker-compose --profile monitoring down
   ```

#### Option 3: Direct Docker Usage

1. **Build the Image**
   ```bash
   ./build-docker.sh
   ```

2. **Run Tests**
   ```bash
   # Default test (1000 VUs, 5 minutes)
   docker run --rm --network host fw-k6:latest
   
   # Custom configuration
   docker run --rm --network host \
     -e VUS=500 \
     -e DURATION=3m \
     -e BASE_URL=http://localhost:4000 \
     fw-k6:latest
   ```

#### Option 4: Using Makefile

```bash
# Run validation
make ci

# Build Docker image
make build

# Start monitoring
make docker-up

# Run SLO tests
make slo-test

# Clean up
make clean
```

### Post-Test Analysis

1. **Review Test Results**
   - Check console output for pass/fail status
   - Review error logs for any issues
   - Validate threshold compliance

2. **Analyze Monitoring Data**
   - Open Grafana: http://localhost:3001
   - Review SLO dashboard
   - Check Prometheus metrics: http://localhost:9090

3. **Generate Reports**
   ```bash
   # Export test results (if configured)
   ls -la test-results/
   
   # View detailed logs
   docker-compose logs k6-websocket-streaming
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env.test` file from the provided example:

```bash
cp .env.test.example .env.test
```

Key configuration options:

| Variable | Default | Description |
|----------|---------|-------------|
| `TEST_TYPE` | `websocket-streaming` | Type of test to run |
| `VUS` | `1000` | Number of virtual users |
| `DURATION` | `5m` | Test duration |
| `BASE_URL` | `http://localhost:4000` | Base API URL |
| `WS_URL` | `ws://localhost:8080` | WebSocket URL |
| `K6_LOG_LEVEL` | `info` | Logging level |
| `SSH_HOST` | - | Remote SSH host for testing |
| `ERROR_RATE_THRESHOLD` | `0.01` | Maximum error rate (1%) |
| `HZ_AVERAGE_THRESHOLD` | `95` | Minimum Hz average |

### Test Types

- `websocket-streaming`: Main test scenario (1000 VUs, 5min, /api/chat)
- `health`: Quick health check
- `comprehensive`: Full application load test
- `custom`: Run custom script with CUSTOM_SCRIPT and CUSTOM_ARGS

## 🐳 Docker Usage

### Build the Docker Image
```bash
cd k6-tests
./build-docker.sh
```

### Run Default WebSocket Streaming Test
```bash
# 1,000 VUs for 5 minutes (as specified in requirements)
docker run --rm --network host fw-k6:latest
```

### Run Health Check
```bash
docker run --rm --network host -e TEST_TYPE=health fw-k6:latest
```

### Run with Custom Parameters
```bash
# Custom VUs and duration
docker run --rm --network host \
  -e VUS=500 \
  -e DURATION=2m \
  fw-k6:latest

# Custom URLs (for remote testing)
docker run --rm \
  -e BASE_URL=http://production-api:4000 \
  -e WS_URL=ws://production-chat:8080 \
  fw-k6:latest
```

### Docker Compose Profiles

```bash
# Run WebSocket streaming load test
docker-compose --profile load-test up k6-websocket-streaming

# Run health check
docker-compose --profile health up k6-health-check

# Run comprehensive test
docker-compose --profile comprehensive up k6-comprehensive

# Run with monitoring stack
docker-compose --profile monitoring up -d prometheus grafana
docker-compose --profile load-test up k6-websocket-streaming
```

## 📊 Monitoring & Dashboards

### Grafana Dashboard

The test suite includes a pre-configured Grafana dashboard that automatically loads when you start the monitoring stack.

**Access Information:**
- **URL**: http://localhost:3001
- **Username**: admin
- **Password**: admin
- **Dashboard**: FlappyJournal SLO Testing Dashboard

**Dashboard Features:**
- Real-time k6 metrics visualization
- SLO compliance monitoring
- Performance trend analysis
- Error rate tracking
- WebSocket connection health
- 100 Hz backend loop monitoring

### Prometheus Metrics

**URL**: http://localhost:9090

**Key Metrics Collected:**
- `k6_http_req_duration` - HTTP request duration
- `k6_ws_connecting` - WebSocket connection attempts
- `k6_ws_connected` - Active WebSocket connections
- `k6_checks` - Test assertion results
- `k6_data_received` - Data received from server
- `k6_data_sent` - Data sent to server

### SLO Monitoring

The dashboard tracks these Service Level Objectives:

1. **Error Rate**: < 1% (0.01)
2. **Hz Average**: > 95
3. **WebSocket Connection Time**: < 5 seconds (95th percentile)
4. **Message Response Time**: < 10 seconds (90th percentile)

### Alerting

Alerting rules are configured for:
- High error rates (> 1%)
- Low Hz performance (< 95)
- WebSocket connection failures
- Service unavailability

## 🔄 Rollback Semantics

### Automated Rollback Triggers

The test suite supports automatic rollback in these scenarios:

1. **Test Failure Rollback**
   ```bash
   # If main test fails, automatically stop monitoring
   ./run-slo-testing.sh run-websocket || {
     echo "Test failed, performing rollback..."
     ./run-slo-testing.sh stop-monitoring
     exit 1
   }
   ```

2. **Service Health Rollback**
   ```bash
   # Health check before main test
   ./run-slo-testing.sh run-health || {
     echo "Health check failed, aborting test run"
     exit 1
   }
   ```

### Manual Rollback Procedures

1. **Stop All Services**
   ```bash
   # Stop monitoring stack
   ./run-slo-testing.sh stop-monitoring
   
   # Or use Docker Compose
   docker-compose --profile monitoring down
   docker-compose --profile load-test down
   docker-compose --profile comprehensive down
   ```

2. **Clean Up Resources**
   ```bash
   # Clean up Docker resources
   make clean
   
   # Remove test volumes
   docker volume rm k6-tests_grafana-storage
   
   # Remove test network
   docker network rm k6-tests_k6-test
   ```

3. **Reset Configuration**
   ```bash
   # Reset to default configuration
   cp .env.test.example .env.test
   
   # Rebuild Docker image
   ./build-docker.sh
   ```

### Rollback Verification

```bash
# Verify services are stopped
docker-compose ps

# Verify ports are free
netstat -tlnp | grep -E ':(3001|9090)'

# Verify Docker resources are cleaned
docker system df
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Connection Refused Errors

**Symptoms:**
```
ERRO[0001] Error: connect ECONNREFUSED 127.0.0.1:4000
```

**Solutions:**
```bash
# Check if Featherweight services are running
curl -f http://localhost:4000/health || echo "API service not running"
curl -f http://localhost:8080/health || echo "WebSocket service not running"

# Check port availability
netstat -tlnp | grep -E ':(4000|8080)'

# Start Featherweight services
# (depends on your setup - docker-compose up, systemctl start, etc.)
```

#### 2. WebSocket Connection Failures

**Symptoms:**
```
ERRO[0001] WebSocket connection failed: unexpected response code: 403
```

**Solutions:**
```bash
# Test WebSocket endpoint manually
wscat -c ws://localhost:8080/api/chat

# Check WebSocket service logs
docker-compose logs chat-service

# Verify authentication if required
curl -H "Authorization: Bearer TOKEN" http://localhost:8080/api/chat
```

#### 3. Hz Metric Not Found

**Symptoms:**
```
WARN[0001] Hz metric not found in /metrics response
```

**Solutions:**
```bash
# Check if metrics endpoint is accessible
curl http://localhost:4000/metrics | grep -i hz

# Verify consciousness loop is running
curl http://localhost:4000/metrics | grep -i loop

# Check service logs for consciousness loop
docker-compose logs consciousness-service
```

#### 4. Docker Network Issues

**Symptoms:**
```
ERRO[0001] Error: connect ECONNREFUSED host.docker.internal:4000
```

**Solutions:**
```bash
# Use host networking (Linux)
docker run --rm --network host fw-k6:latest

# Update URLs for Docker Desktop (Mac/Windows)
docker run --rm \
  -e BASE_URL=http://host.docker.internal:4000 \
  -e WS_URL=ws://host.docker.internal:8080 \
  fw-k6:latest

# Check Docker network configuration
docker network ls
docker network inspect k6-tests_k6-test
```

#### 5. Resource Exhaustion

**Symptoms:**
```
ERRO[0001] Too many open files
ERRO[0001] dial tcp: lookup localhost: no such host
```

**Solutions:**
```bash
# Increase file descriptor limits
ulimit -n 65536

# Reduce concurrent virtual users
docker run --rm --network host -e VUS=100 fw-k6:latest

# Monitor system resources
htop
docker stats
```

#### 6. Permission Denied

**Symptoms:**
```
ERRO[0001] Permission denied: /var/lib/grafana
```

**Solutions:**
```bash
# Fix Grafana permissions
sudo chown -R 472:472 ./grafana-data

# Run with correct user
docker run --rm --user $(id -u):$(id -g) fw-k6:latest

# Check file permissions
ls -la ./grafana-provisioning/
```

### Debug Mode

Enable detailed debugging:

```bash
# Enable debug logging
export K6_LOG_LEVEL=debug

# Run with verbose output
docker run --rm --network host \
  -e K6_LOG_LEVEL=debug \
  -e DEBUG_MODE=true \
  fw-k6:latest

# Save debug output
docker run --rm --network host \
  -e K6_LOG_LEVEL=debug \
  fw-k6:latest > debug.log 2>&1
```

### Health Check Debugging

```bash
# Run health check with verbose output
./run-slo-testing.sh run-health

# Check individual service health
curl -v http://localhost:4000/health
curl -v http://localhost:8080/health
curl -v http://localhost:9090/-/healthy
curl -v http://localhost:3001/api/health
```

## 🔌 SSH Disconnection Recovery

### Preventing SSH Disconnections

1. **Configure SSH Keep-Alive**
   ```bash
   # Add to ~/.ssh/config
   Host *
       ServerAliveInterval 60
       ServerAliveCountMax 3
       TCPKeepAlive yes
   ```

2. **Use Screen or Tmux**
   ```bash
   # Start screen session
   screen -S k6-test
   
   # Run your test
   ./run-slo-testing.sh run-websocket
   
   # Detach with Ctrl+A, D
   # Reattach with: screen -r k6-test
   ```

3. **Use Tmux (Alternative)**
   ```bash
   # Start tmux session
   tmux new-session -d -s k6-test
   
   # Run test in tmux
   tmux send-keys -t k6-test './run-slo-testing.sh run-websocket' C-m
   
   # Attach to session
   tmux attach-session -t k6-test
   ```

### SSH Disconnection Recovery Procedures

#### If Disconnected During Test Run

1. **Reconnect and Check Status**
   ```bash
   # Reconnect to server
   ssh user@server
   
   # Check if test is still running
   ps aux | grep k6
   docker ps | grep k6
   
   # Check monitoring services
   docker-compose ps
   ```

2. **Reattach to Running Session**
   ```bash
   # Reattach to screen
   screen -r k6-test
   
   # Reattach to tmux
   tmux attach-session -t k6-test
   
   # Check Docker logs
   docker-compose logs -f k6-websocket-streaming
   ```

3. **Recovery Actions**
   ```bash
   # If test completed, check results
   ./run-slo-testing.sh dashboard-url
   
   # If test failed, check logs
   docker-compose logs k6-websocket-streaming > test-failure.log
   
   # If test is stuck, restart it
   ./run-slo-testing.sh stop-monitoring
   ./run-slo-testing.sh start-monitoring
   ./run-slo-testing.sh run-websocket
   ```

#### Recovery Checklist

```bash
# 1. Check system state
ps aux | grep -E '(k6|prometheus|grafana)'
docker ps
netstat -tlnp | grep -E ':(3001|9090)'

# 2. Check test results
ls -la test-results/
docker-compose logs k6-websocket-streaming | tail -50

# 3. Verify monitoring
curl http://localhost:9090/-/healthy
curl http://localhost:3001/api/health

# 4. Resume or restart as needed
./run-slo-testing.sh dashboard-url
```

### Automated Recovery Scripts

Create a recovery script for common scenarios:

```bash
#!/bin/bash
# recovery.sh - SSH disconnection recovery

echo "🔄 Starting SSH disconnection recovery..."

# Check if monitoring is running
if ! curl -s http://localhost:9090/-/healthy > /dev/null; then
    echo "📊 Restarting monitoring stack..."
    ./run-slo-testing.sh start-monitoring
    sleep 10
fi

# Check if test is still running
if ! docker ps | grep k6 > /dev/null; then
    echo "🧪 Test not running, checking last results..."
    docker-compose logs k6-websocket-streaming | tail -20
    
    echo "🔄 Restarting test..."
    ./run-slo-testing.sh run-websocket
fi

echo "✅ Recovery completed. Check dashboard: http://localhost:3001"
```

## 📈 Performance Benchmarks

### Test Requirements Met

#### ✅ Scenario Requirements
- [x] 1,000 virtual users
- [x] 5 minute duration
- [x] Hitting `/api/chat` with WebSocket streaming
- [x] Checking 100 Hz backend loop metric via `/metrics`

#### ✅ Threshold Requirements
- [x] `error_rate < 0.01` (< 1% error rate)
- [x] `checks{type:hz}.avg > 95` (Hz checks average > 95)

#### ✅ Docker Requirements
- [x] Wrapped in Docker image `fw-k6:latest`
- [x] Reproducible execution
- [x] Configurable via environment variables

### Success Criteria

- ✅ Error rate below 1% (`error_rate < 0.01`)
- ✅ Hz average above 95 (`checks{type:hz}.avg > 95`)
- ✅ All WebSocket connections establish successfully
- ✅ Chat messages receive streaming responses
- ✅ No critical failures in consciousness loop

### Performance Targets

- **WebSocket Connection Time**: < 5 seconds (95th percentile)
- **Message Response Time**: < 10 seconds (90th percentile)
- **System Stability**: Throughout 5-minute test duration
- **Consciousness Loop**: Maintains 100 Hz ± 5%

### Expected Test Output

```
running (7m30.0s), 0000/1000 VUs, 15420 complete and 0 interrupted iterations
websocket-streaming ✓ [======================================] 1000 VUs  5m0s

✓ error_rate..................: 0.00% ✓ 0    ✗ 15420
✓ checks{type:hz}..............: avg=98.5  min=95.2  max=100.1
✓ ws_connection_time...........: avg=245ms min=120ms max=890ms
✓ message_response_time........: avg=2.1s  min=500ms max=8.7s
✓ WebSocket connection established
✓ Message streaming successful
✓ Hz metric validation passed
```

## 📋 Sample Files

### .env.test.example

A complete `.env.test.example` file is provided with all configurable options. Copy it to `.env.test` and modify as needed:

```bash
cp .env.test.example .env.test
```

### Grafana Dashboard

The Grafana dashboard is automatically loaded from `./dashboards/testing.json` and provides:

- Real-time k6 metrics visualization
- SLO compliance monitoring
- Performance trend analysis
- Error rate tracking
- WebSocket connection health
- 100 Hz backend loop monitoring

**Dashboard Screenshots:**
- Main SLO Overview Panel
- WebSocket Connection Metrics
- Performance Trend Analysis
- Error Rate Monitoring
- Hz Loop Performance

The dashboard is accessible at: http://localhost:3001/d/testing/flappyjournal-slo-testing-dashboard

## 🔍 Additional Resources

### Useful Commands

```bash
# Quick test run
make slo-test

# Validation pipeline
make ci

# Clean up everything
make clean

# Monitor real-time
docker-compose logs -f k6-websocket-streaming

# Export results
docker cp $(docker ps -lq):/tmp/results.json ./test-results/
```

### Configuration Files

- `docker-compose.yml` - Service orchestration
- `prometheus.yml` - Prometheus configuration
- `alerting-rules.yml` - Alerting rules
- `Dockerfile` - k6 test container
- `grafana-provisioning/` - Grafana auto-configuration

### Scripts

- `run-slo-testing.sh` - Main test orchestration
- `validate-slo-setup.sh` - Setup validation
- `build-docker.sh` - Docker image building
- `test-setup.sh` - Environment setup

This comprehensive load testing suite ensures the Featherweight chat system can handle 1,000 concurrent users while maintaining the critical 100 Hz consciousness loop performance, with full monitoring, alerting, and recovery capabilities.
