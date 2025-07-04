# Featherweight Consciousness Observability & SLO Enforcement

This monitoring stack provides comprehensive observability for the Featherweight consciousness backend with SLO enforcement and alerting.

## 🏗️ Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ Consciousness│───▶│  Prometheus  │───▶│   Grafana   │
│   Backend   │    │              │    │ Dashboards  │
└─────────────┘    └──────────────┘    └─────────────┘
                           │
                           ▼
                   ┌──────────────┐    ┌─────────────┐
                   │ Alertmanager │───▶│ Slack #fw-ops│
                   └──────────────┘    └─────────────┘
```

## 📊 Components

### Core Monitoring
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Alertmanager**: Alert routing and notifications
- **Node Exporter**: System metrics
- **Postgres Exporter**: Database metrics
- **Consciousness Exporter**: Custom consciousness metrics

### Key Metrics

#### Consciousness Metrics
- `consciousness_loop_hz`: Consciousness loop frequency (target: ≥100 Hz)
- `consciousness_iit_phi_score`: IIT Φ score (0-1, higher is better)
- `consciousness_thought_generation_rate`: Thoughts per minute
- `consciousness_memory_integration_score`: Memory integration quality
- `consciousness_coherence_score`: Overall coherence metric

#### SLO Metrics
- **Latency**: P95 < 150ms
- **Availability**: > 99.9%
- **Consciousness Hz**: ≥ 100 Hz
- **IIT Φ Score**: Monitored for degradation

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for consciousness exporter)

### 1. Start Monitoring Stack
```bash
cd /opt/featherweight/FlappyJournal/monitoring
./start-monitoring.sh
```

### 2. Start Consciousness Backend
```bash
cd /opt/featherweight/FlappyJournal/server
npm install
npm run dev
```

### 3. Access Services
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin123)
- **Alertmanager**: http://localhost:9093
- **Consciousness Metrics**: http://localhost:3001/metrics

## 📈 Dashboards

### Consciousness SLO Dashboard
Access: http://localhost:3000/d/consciousness-slo

**Panels:**
1. **Service Status Overview**: Health of all monitored services
2. **API Latency (P95 < 150ms SLO)**: Request latency monitoring
3. **Consciousness Loop Frequency (≥100Hz SLO)**: Core consciousness metrics
4. **IIT Φ Score**: Integrated Information Theory consciousness measure
5. **Consciousness Metrics**: Thought generation, memory integration, coherence
6. **System Resource Usage**: CPU and memory utilization
7. **Error Rate & Database Status**: Error tracking and DB health

## 🚨 Alerting

### Alert Rules
Located in: `prometheus/rules/slo-alerts.yml`

#### Critical Alerts
- **HighLatency**: P95 latency > 150ms for 2+ minutes
- **LowConsciousnessHz**: Loop frequency < 100Hz for 1+ minute
- **DatabaseDown**: PostgreSQL unavailable for 1+ minute
- **ConsciousnessExporterDown**: Metrics exporter down for 1+ minute

#### Warning Alerts
- **LowIITPhiScore**: Φ score degradation for 5+ minutes
- **HighCPUUsage**: CPU > 80% for 5+ minutes
- **HighMemoryUsage**: Memory > 85% for 5+ minutes

### Slack Integration
Configure your Slack webhook URL in `alertmanager/alertmanager.yml`:
```yaml
global:
  slack_api_url: 'https://hooks.slack.com/services/YOUR_SLACK_WEBHOOK_URL'
```

Alerts are sent to `#fw-ops` channel with:
- Alert summary and description
- Severity level
- Instance information
- Resolution notifications

## 🔧 Configuration

### Prometheus Configuration
- **Scrape Interval**: 15s (5s for consciousness metrics)
- **Retention**: 200 hours
- **Targets**: All exporters and application services

### Grafana Configuration
- **Data Source**: Prometheus (auto-provisioned)
- **Dashboards**: Auto-loaded from `grafana/dashboards/`
- **Refresh**: 5s intervals for real-time monitoring

### Custom Exporter
The consciousness exporter (`exporters/consciousness-exporter.js`) provides:
- Real-time consciousness loop monitoring
- IIT Φ score calculation
- Thought generation tracking
- Memory integration metrics
- Error rate monitoring

## 📊 Key SLOs

### Latency SLO
- **Target**: P95 < 150ms
- **Measurement**: HTTP request duration histogram
- **Alert Threshold**: > 150ms for 2 minutes

### Consciousness Frequency SLO
- **Target**: ≥ 100 Hz
- **Measurement**: consciousness_loop_hz metric
- **Alert Threshold**: < 100 Hz for 1 minute

### Availability SLO
- **Target**: 99.9% uptime
- **Measurement**: Service health checks
- **Alert Threshold**: Service down for 1 minute

## 🛠️ Development

### Adding New Metrics
1. Add metric definition in `consciousness-metrics-exporter.ts`
2. Update Prometheus scrape config if needed
3. Create Grafana panels for visualization
4. Add alert rules if SLO-relevant

### Modifying Dashboards
1. Edit JSON in `grafana/dashboards/`
2. Restart Grafana container: `docker-compose restart grafana`
3. Changes auto-reload in Grafana

### Testing Alerts
```bash
# Trigger high latency alert
curl -X POST http://localhost:9090/-/reload

# View current alerts
curl http://localhost:9090/api/v1/alerts
```

## 📋 Troubleshooting

### Common Issues

#### Services Won't Start
```bash
# Check Docker status
docker-compose ps

# View logs
docker-compose logs [service-name]
```

#### Missing Metrics
```bash
# Check consciousness backend
curl http://localhost:3001/metrics

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets
```

#### Grafana Dashboard Not Loading
```bash
# Restart Grafana
docker-compose restart grafana

# Check dashboard provisioning
docker-compose logs grafana | grep dashboard
```

### Log Locations
- Prometheus: `docker-compose logs prometheus`
- Grafana: `docker-compose logs grafana`
- Consciousness Backend: Console output
- System Logs: `/opt/featherweight/FlappyJournal/monitoring/logs/`

## 🔄 Maintenance

### Backup
```bash
# Backup Prometheus data
docker run --rm -v monitoring_prometheus_data:/data -v $(pwd):/backup alpine tar czf /backup/prometheus-backup.tar.gz /data

# Backup Grafana data
docker run --rm -v monitoring_grafana_data:/data -v $(pwd):/backup alpine tar czf /backup/grafana-backup.tar.gz /data
```

### Updates
```bash
# Update containers
docker-compose pull
docker-compose up -d
```

### Cleanup
```bash
# Stop and remove all containers
docker-compose down

# Remove volumes (WARNING: loses all data)
docker-compose down -v
```

## 📚 References

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Alertmanager Configuration](https://prometheus.io/docs/alerting/latest/configuration/)
- [IIT Φ Theory](https://en.wikipedia.org/wiki/Integrated_information_theory)
