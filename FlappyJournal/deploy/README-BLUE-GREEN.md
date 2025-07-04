# Blue-Green Deployment System for FlappyJournal v1.0-full-tech

## 🎯 Overview

This directory contains the complete blue-green deployment system for FlappyJournal v1.0-full-tech, providing zero-downtime deployments with instant rollback capability.

## 📁 Directory Structure

```
deploy/
├── README-BLUE-GREEN.md           # This file
├── docker-compose.blue-green.yml  # Multi-environment orchestration
├── .env.blue-green                # Environment configuration
├── .current-environment            # Active environment tracker
├── caddy/
│   └── Caddyfile.blue-green       # Load balancer configuration
├── deployment.log                 # Deployment history
├── promotion.log                  # Promotion history
└── rollback.log                   # Rollback history
```

## 🚀 Quick Start

### 1. Deploy to Staging and Production
```bash
# Full deployment pipeline
./scripts/deploy-blue-green.sh deploy

# Deploy staging only
./scripts/deploy-blue-green.sh staging-only

# Deploy blue environment only
./scripts/deploy-blue-green.sh blue-only
```

### 2. Promote Environment
```bash
# Check current status
./scripts/promote.sh status

# Promote blue to production
./scripts/promote.sh promote blue

# Validate environment before promotion
./scripts/promote.sh validate green
```

### 3. Emergency Rollback
```bash
# Instant rollback
FORCE_ROLLBACK=true ./scripts/rollback.sh rollback

# Check rollback status
./scripts/rollback.sh status
```

## 🏗️ Architecture

### Environment Layout
- **Blue Environment**: Production candidate (v1.0-full-tech)
- **Green Environment**: Backup/rollback target (v0.9-backup)
- **Staging Environment**: Pre-production testing (latest)

### Traffic Routing
```
Internet → Caddy Load Balancer → Active Environment (Blue/Green)
                               → Staging Environment
```

### Service Structure per Environment
```
[environment]-auth-service         (Port 4001)
[environment]-consciousness-backend (Port 4003, gRPC 50051)
[environment]-chat-orchestrator    (Port 4002)
[environment]-api-gateway          (Port 4000)
```

## 🔄 Deployment Flow

### Standard Deployment Process
1. **Staging Deployment**: Deploy new version to staging environment
2. **Staging Validation**: Run comprehensive Cypress test suite
3. **Blue Deployment**: Deploy to blue environment if staging passes
4. **Health Verification**: Ensure blue environment is healthy
5. **Production Promotion**: Switch traffic from green to blue
6. **Post-deployment Testing**: Validate production functionality

### Rollback Process
1. **Issue Detection**: Monitoring or manual detection of problems
2. **Health Check**: Verify backup environment is ready
3. **Traffic Switch**: Instant routing change via Caddy
4. **Verification**: Confirm rollback success and system health

## 📋 Environment Configuration

### Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `BLUE_TAG` | Blue environment version | `v1.0-full-tech` |
| `GREEN_TAG` | Green environment version | `v0.9-backup` |
| `STAGING_TAG` | Staging environment version | `latest` |
| `POSTGRES_PASSWORD` | Database password | `secure_password` |
| `JWT_SECRET` | Authentication secret | `jwt_secret_key` |
| `CLOUDFLARE_API_TOKEN` | SSL certificate management | `cf_token` |

### Service Health Endpoints
- **Production**: `https://app.featherweight.world/api/health`
- **Staging**: `https://staging.app.featherweight.world/api/health`
- **Blue (Internal)**: `http://blue.internal.featherweight.world/health`
- **Green (Internal)**: `http://green.internal.featherweight.world/health`

## 🔍 Monitoring and Observability

### Health Checks
- **Application Health**: `/api/health` endpoint on each service
- **Database Health**: PostgreSQL connection and query validation
- **Load Balancer**: Caddy health checks and routing validation
- **Container Health**: Docker container status and resource usage

### Logging
- **Deployment Logs**: `deployment.log` - All deployment activities
- **Promotion Logs**: `promotion.log` - Environment promotion history
- **Rollback Logs**: `rollback.log` - Rollback execution history
- **Application Logs**: Container logs via Docker Compose

### Metrics Collection
- **Prometheus**: Metrics scraping from all services
- **Grafana**: Visualization and alerting dashboards
- **Custom Metrics**: Application-specific performance indicators

## 🔧 Operational Procedures

### Daily Operations
```bash
# Check system status
./scripts/rollback.sh status

# View recent activities
tail -f deploy/deployment.log
tail -f deploy/promotion.log
```

### Maintenance Tasks
```bash
# Update backup environment
./scripts/promote.sh prepare green v0.9.1-backup

# Rotate logs (monthly)
docker compose -f deploy/docker-compose.blue-green.yml logs --no-log-prefix > archive-$(date +%Y%m).log

# Database maintenance
docker exec deploy-postgres-1 pg_dump flappyjournal > backup-$(date +%Y%m%d).sql
```

### Security Updates
```bash
# Deploy security patch to staging
STAGING_TAG=v1.0.1-security ./scripts/deploy-blue-green.sh staging-only

# Promote to blue after validation
./scripts/promote.sh prepare blue v1.0.1-security
./scripts/promote.sh promote blue
```

## 🚨 Troubleshooting

### Common Issues

#### Issue: "Caddy reload failed"
**Cause**: Caddy container not responding or configuration error
**Solution**:
```bash
# Check Caddy status
docker ps | grep caddy
docker logs deploy-caddy-1

# Restart Caddy if needed
docker compose -f deploy/docker-compose.blue-green.yml restart caddy
```

#### Issue: "Environment health check failed"
**Cause**: Service not ready or database connection issues
**Solution**:
```bash
# Check individual service health
docker compose -f deploy/docker-compose.blue-green.yml logs blue-api-gateway

# Verify database connectivity
docker exec deploy-postgres-1 pg_isready

# Restart environment services
docker compose -f deploy/docker-compose.blue-green.yml restart blue-auth-service
```

#### Issue: "Deployment timeout"
**Cause**: Services taking too long to start or health checks failing
**Solution**:
```bash
# Increase timeout in script
export TIMEOUT=600

# Check resource usage
docker stats

# Review container limits
docker compose -f deploy/docker-compose.blue-green.yml config
```

### Emergency Procedures

#### Complete System Failure
```bash
# 1. Stop all services
docker compose -f deploy/docker-compose.blue-green.yml down

# 2. Start with backup environment only
docker compose -f deploy/docker-compose.blue-green.yml --profile green up -d

# 3. Point traffic to green
./scripts/promote.sh promote green

# 4. Investigate issues
docker compose -f deploy/docker-compose.blue-green.yml logs > emergency-logs.txt
```

#### Database Corruption
```bash
# 1. Stop application services
docker compose -f deploy/docker-compose.blue-green.yml stop blue-api-gateway green-api-gateway

# 2. Restore database from backup
docker exec deploy-postgres-1 psql -d flappyjournal < latest-backup.sql

# 3. Restart services
docker compose -f deploy/docker-compose.blue-green.yml start blue-api-gateway green-api-gateway
```

## 📊 Performance Optimization

### Resource Allocation
- **API Gateway**: 512MB RAM, 0.5 CPU
- **Auth Service**: 256MB RAM, 0.25 CPU
- **Consciousness Backend**: 1GB RAM, 1.0 CPU
- **Chat Orchestrator**: 512MB RAM, 0.5 CPU
- **Database**: 2GB RAM, 1.0 CPU

### Scaling Considerations
```bash
# Scale specific services
docker compose -f deploy/docker-compose.blue-green.yml up -d --scale blue-api-gateway=2

# Monitor resource usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

## 🔮 Future Enhancements

### Planned Improvements
- **Canary Deployments**: Gradual traffic shifting
- **Auto-scaling**: Horizontal pod autoscaling
- **Multi-region**: Geographic distribution
- **A/B Testing**: Feature flag integration

### Infrastructure Evolution
- **Kubernetes Migration**: Container orchestration upgrade
- **Service Mesh**: Enhanced microservice communication
- **GitOps**: Automated deployment from Git
- **Infrastructure as Code**: Terraform management

## 📚 Additional Resources

### Documentation
- [Release Notes](../release-notes-v1.0.md)
- [Rollback Instructions](../ROLLBACK_INSTRUCTIONS.md)
- [Architecture Overview](../Target-Architecture.md)
- [Monitoring Guide](../monitoring/README.md)

### Scripts
- [Deploy Script](../scripts/deploy-blue-green.sh)
- [Rollback Script](../scripts/rollback.sh)
- [Promotion Script](../scripts/promote.sh)

### External Links
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Caddy Documentation](https://caddyserver.com/docs/)
- [Blue-Green Deployment Pattern](https://martinfowler.com/bliki/BlueGreenDeployment.html)

---

**System Status**: ✅ Production Ready  
**Last Updated**: July 4, 2025  
**Maintained By**: DevOps Team  
**Emergency Contact**: [Your emergency contact information]
