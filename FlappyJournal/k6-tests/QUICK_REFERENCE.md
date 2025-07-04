# K6 Load Testing Quick Reference

## 🚀 Quick Start Commands

```bash
# 1. Start monitoring
./run-slo-testing.sh start-monitoring

# 2. Run main test
./run-slo-testing.sh run-websocket

# 3. View dashboard
./run-slo-testing.sh dashboard-url

# 4. Stop monitoring
./run-slo-testing.sh stop-monitoring
```

## 📁 Important Files

- `README.md` - Complete documentation
- `.env.test.example` - Environment configuration template
- `recovery.sh` - SSH disconnection recovery
- `DASHBOARD_SCREENSHOTS.md` - Dashboard documentation
- `run-slo-testing.sh` - Main orchestration script

## 🔧 Common Troubleshooting

```bash
# Health check
./run-slo-testing.sh run-health

# Recovery from SSH disconnect
./recovery.sh

# Clean up everything
make clean

# Debug mode
docker run --rm --network host -e K6_LOG_LEVEL=debug fw-k6:latest
```

## 📊 Dashboard URLs

- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090
- SLO Dashboard: http://localhost:3001/d/testing/flappyjournal-slo-testing-dashboard

## 🎯 Test Thresholds

- Error rate: < 1%
- Hz average: > 95
- WebSocket connection: < 5s (95th percentile)
- Message response: < 10s (90th percentile)
