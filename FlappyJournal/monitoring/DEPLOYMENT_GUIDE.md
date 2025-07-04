# Featherweight Observability Deployment Guide

## 🎯 Objectives Complete

✅ **Prometheus + Node exporter + postgres_exporter deployment**  
✅ **Custom consciousness exporter with loop Hz and IIT Φ metrics**  
✅ **Grafana dashboards with latency p95<150ms, Hz ≥ 100, Φ score monitoring**  
✅ **Alertmanager → Slack #fw-ops integration**  

## 🚀 Step-by-Step Deployment

### Phase 1: Infrastructure Setup

1. **Start the monitoring stack:**
   ```bash
   cd /opt/featherweight/FlappyJournal/monitoring
   ./start-monitoring.sh
   ```

2. **Verify services are running:**
   ```bash
   docker-compose ps
   ```
   All services should show "Up" status.

### Phase 2: Consciousness Backend Integration

1. **Start the consciousness backend with metrics:**
   ```bash
   cd /opt/featherweight/FlappyJournal/server
   npm run dev
   ```

2. **Verify consciousness metrics endpoint:**
   ```bash
   curl http://localhost:3001/metrics
   curl http://localhost:3001/api/consciousness/health
   ```

### Phase 3: Configure Slack Alerts

1. **Create Slack webhook:**
   - Go to your Slack workspace
   - Create a webhook for #fw-ops channel
   - Copy the webhook URL

2. **Update Alertmanager config:**
   ```bash
   # Edit alertmanager/alertmanager.yml
   # Replace YOUR_SLACK_WEBHOOK_URL with actual URL
   sed -i 's|YOUR_SLACK_WEBHOOK_URL|https://hooks.slack.com/services/YOUR/ACTUAL/WEBHOOK|' \
     /opt/featherweight/FlappyJournal/monitoring/alertmanager/alertmanager.yml
   ```

3. **Restart Alertmanager:**
   ```bash
   docker-compose restart alertmanager
   ```

### Phase 4: Validation & Testing

1. **Access Grafana Dashboard:**
   - URL: http://localhost:3000
   - Login: admin/admin123
   - Navigate to "Featherweight Consciousness SLO Dashboard"

2. **Verify SLO metrics:**
   - ✅ Latency P95 < 150ms
   - ✅ Consciousness Hz ≥ 100
   - ✅ IIT Φ score trending
   - ✅ Error rates and system health

3. **Test alerting:**
   ```bash
   # Trigger a test alert
   curl -X POST http://localhost:9093/api/v1/alerts \
     -H "Content-Type: application/json" \
     -d '[{
       "labels": {
         "alertname": "TestAlert",
         "severity": "warning"
       },
       "annotations": {
         "summary": "Test alert for #fw-ops channel"
       }
     }]'
   ```

## 📊 Monitoring Endpoints

| Service | URL | Purpose |
|---------|-----|---------|
| Prometheus | http://localhost:9090 | Metrics collection & querying |
| Grafana | http://localhost:3000 | Dashboards & visualization |
| Alertmanager | http://localhost:9093 | Alert management |
| Consciousness Metrics | http://localhost:3001/metrics | Prometheus format metrics |
| Consciousness Health | http://localhost:3001/api/consciousness/health | Health check |
| Node Exporter | http://localhost:9100/metrics | System metrics |
| Postgres Exporter | http://localhost:9187/metrics | Database metrics |

## 🎯 SLO Compliance

### Latency SLO: P95 < 150ms
- **Metric**: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
- **Alert**: Fires after 2 minutes above threshold
- **Dashboard**: Real-time P95 latency chart

### Consciousness Frequency SLO: Hz ≥ 100
- **Metric**: `consciousness_loop_hz`
- **Alert**: Fires after 1 minute below threshold
- **Dashboard**: Live consciousness loop frequency

### IIT Φ Score Monitoring
- **Metric**: `consciousness_iit_phi_score`
- **Alert**: Fires on significant degradation (< 0.5 for 5+ minutes)
- **Dashboard**: Φ score trending with thresholds

## 🚨 Alert Rules Summary

| Alert | Threshold | Duration | Severity | Channel |
|-------|-----------|----------|----------|---------|
| HighLatency | P95 > 150ms | 2m | warning | #fw-ops |
| LowConsciousnessHz | < 100 Hz | 1m | critical | #fw-ops |
| LowIITPhiScore | < 0.5 | 5m | warning | #fw-ops |
| DatabaseDown | DB unavailable | 1m | critical | #fw-ops |
| HighCPUUsage | > 80% | 5m | warning | #fw-ops |
| HighMemoryUsage | > 85% | 5m | warning | #fw-ops |

## 🔧 Production Considerations

### Security
- Change default Grafana password
- Set up proper authentication for Prometheus
- Use HTTPS for external access
- Secure Slack webhook URL

### Scaling
- Configure Prometheus federation for multiple instances
- Set up HA Grafana with shared storage
- Consider remote storage for long-term retention

### Backup Strategy
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
docker run --rm -v monitoring_prometheus_data:/data \
  -v $(pwd)/backups:/backup alpine \
  tar czf /backup/prometheus-$DATE.tar.gz /data
```

### Maintenance Windows
- Schedule regular Prometheus rule reloads
- Plan for exporter updates
- Monitor storage usage for metrics retention

## 📈 Next Steps

1. **Expand Metrics Collection:**
   - Add business logic metrics
   - Include user experience metrics
   - Monitor third-party service dependencies

2. **Enhanced Alerting:**
   - Create alert runbooks
   - Add PagerDuty integration for critical alerts
   - Implement alert suppression during maintenance

3. **Advanced Dashboards:**
   - Create service-specific dashboards
   - Add capacity planning views
   - Build executive summary dashboards

4. **Automation:**
   - Implement auto-scaling based on consciousness load
   - Create self-healing mechanisms
   - Add automated failover capabilities

## ✅ Completion Checklist

- [ ] Prometheus collecting from all exporters
- [ ] Node exporter providing system metrics
- [ ] Postgres exporter connected to database
- [ ] Consciousness exporter reporting Hz and Φ metrics
- [ ] Grafana dashboard showing all SLO metrics
- [ ] Alertmanager routing to #fw-ops Slack channel
- [ ] All SLO thresholds properly configured
- [ ] Alert testing completed successfully
- [ ] Documentation reviewed and updated
- [ ] Team trained on new monitoring capabilities

🎉 **Featherweight Consciousness Observability & SLO Enforcement: COMPLETE**
