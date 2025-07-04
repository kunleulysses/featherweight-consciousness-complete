# FlappyJournal v1.0-full-tech Rollback Instructions

## 🚨 Emergency Rollback Procedures

This document provides comprehensive instructions for rolling back FlappyJournal v1.0-full-tech deployment in case of issues. Our blue-green deployment strategy enables instant rollback with zero downtime.

---

## 📋 Quick Reference

### Immediate Emergency Rollback
```bash
# EMERGENCY: Instant rollback (no confirmation)
FORCE_ROLLBACK=true ./scripts/rollback.sh rollback

# Check status after rollback
./scripts/rollback.sh status
```

### Standard Rollback Process
```bash
# 1. Check current status
./scripts/rollback.sh status

# 2. Validate rollback possibility
./scripts/rollback.sh validate

# 3. Execute rollback with confirmation
./scripts/rollback.sh rollback

# 4. Monitor post-rollback health
./scripts/rollback.sh status
```

---

## 🔄 Rollback Scenarios

### Scenario 1: Post-Deployment Issues
**When**: Issues discovered immediately after v1.0-full-tech deployment

**Steps**:
1. **Assess Impact**: Determine if rollback is necessary
   ```bash
   ./scripts/rollback.sh status
   ```

2. **Validate Target Environment**: Ensure backup environment is healthy
   ```bash
   ./scripts/rollback.sh validate
   ```

3. **Execute Rollback**: Switch traffic to backup environment
   ```bash
   ./scripts/rollback.sh rollback
   ```

4. **Verify Success**: Confirm services are running on backup version
   ```bash
   curl -s https://app.featherweight.world/api/health | jq .
   ```

### Scenario 2: Staging Validation Failure
**When**: Cypress tests fail on staging environment

**Steps**:
1. **Stop Deployment**: Cancel promotion to production
   ```bash
   # Deployment will automatically stop if staging tests fail
   echo "Deployment stopped due to staging validation failure"
   ```

2. **Investigate Issues**: Review test results and logs
   ```bash
   # Check Cypress test results
   cat cypress-results-staging.json
   
   # Review staging logs
   docker compose -f deploy/docker-compose.blue-green.yml logs staging-api-gateway
   ```

3. **Fix and Redeploy**: Address issues and restart deployment
   ```bash
   # Fix issues in code, then redeploy to staging
   ./scripts/deploy-blue-green.sh staging-only
   ```

### Scenario 3: Production Performance Issues
**When**: Performance degradation detected in production

**Steps**:
1. **Monitor Metrics**: Check Grafana dashboards
   - Visit: https://monitoring.featherweight.world
   - Check CPU, memory, and response time metrics

2. **Quick Assessment**: Determine if rollback is needed
   ```bash
   # Check response times
   time curl -s https://app.featherweight.world/api/health
   
   # Check error rates
   docker compose -f deploy/docker-compose.blue-green.yml logs --tail=100 blue-api-gateway | grep ERROR
   ```

3. **Execute Rollback if Critical**:
   ```bash
   ROLLBACK_REASON="Performance degradation - high response times" \
   FORCE_ROLLBACK=true ./scripts/rollback.sh rollback
   ```

### Scenario 4: Database Migration Issues
**When**: Database schema changes cause compatibility issues

**Steps**:
1. **Check Database Health**:
   ```bash
   docker exec deploy-postgres-1 pg_isready -d flappyjournal
   ```

2. **Review Migration Status**:
   ```bash
   # Check migration logs
   docker compose -f deploy/docker-compose.blue-green.yml logs consciousness-backend | grep migration
   ```

3. **Rollback Database if Needed**:
   ```bash
   # Database rollback (if migration scripts support it)
   docker exec deploy-postgres-1 psql -d flappyjournal -c "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 5;"
   ```

4. **Application Rollback**:
   ```bash
   ROLLBACK_REASON="Database migration compatibility issues" \
   ./scripts/rollback.sh rollback
   ```

---

## 🔍 Pre-Rollback Checklist

### 1. Assess Current Situation
- [ ] **Identify the Issue**: What exactly is wrong?
- [ ] **Impact Assessment**: How many users are affected?
- [ ] **Severity Level**: Is this critical enough for rollback?
- [ ] **Alternative Solutions**: Can the issue be fixed without rollback?

### 2. Check Environment Status
```bash
# Check current deployment status
./scripts/rollback.sh status

# Verify backup environment health
./scripts/rollback.sh validate

# Check container health
docker compose -f deploy/docker-compose.blue-green.yml ps
```

### 3. Communication
- [ ] **Notify Team**: Alert relevant stakeholders
- [ ] **Document Issue**: Record the problem for post-mortem
- [ ] **Prepare Communications**: Draft user-facing status updates if needed

### 4. Backup Current State
```bash
# Export current configuration
docker compose -f deploy/docker-compose.blue-green.yml config > backup-config-$(date +%Y%m%d%H%M).yml

# Backup current logs
docker compose -f deploy/docker-compose.blue-green.yml logs > backup-logs-$(date +%Y%m%d%H%M).log
```

---

## ⚡ Rollback Execution

### Automated Rollback Process

The rollback process is automated through our blue-green deployment:

1. **Traffic Switch**: Caddy load balancer instantly routes traffic to backup environment
2. **Health Verification**: Automatic health checks ensure backup environment is ready
3. **Monitoring Update**: Metrics and logs switch to track the new active environment
4. **State Persistence**: User sessions and data remain intact during switch

### Manual Verification Steps

After executing rollback, verify these components:

#### 1. Application Health
```bash
# Check main application
curl -s https://app.featherweight.world/api/health | jq '.status'

# Verify authentication service
curl -s https://app.featherweight.world/api/auth/health | jq '.status'

# Test WebSocket connectivity
# (Use browser dev tools or WebSocket test client)
```

#### 2. Database Connectivity
```bash
# Check database connections
docker exec deploy-postgres-1 psql -d flappyjournal -c "SELECT count(*) FROM pg_stat_activity;"

# Verify application can connect
docker compose -f deploy/docker-compose.blue-green.yml logs green-consciousness-backend | grep "Database connected"
```

#### 3. User Experience
- [ ] **Login Functionality**: Test user authentication
- [ ] **Core Features**: Verify journal creation/editing
- [ ] **Chat Interface**: Test AI consciousness interaction
- [ ] **API Responses**: Check response times and accuracy

#### 4. Monitoring and Alerts
```bash
# Check Prometheus targets
curl -s http://monitoring.featherweight.world:9090/api/v1/targets | jq '.data.activeTargets[].health'

# Verify Grafana dashboards
# Visit: https://monitoring.featherweight.world
```

---

## 🔧 Troubleshooting Rollback Issues

### Issue: Rollback Script Fails
**Symptoms**: `./scripts/rollback.sh rollback` returns error

**Solutions**:
1. **Check Docker Status**:
   ```bash
   docker info
   systemctl status docker
   ```

2. **Verify Caddy Container**:
   ```bash
   docker ps | grep caddy
   docker logs deploy-caddy-1
   ```

3. **Manual Caddy Reload**:
   ```bash
   docker exec deploy-caddy-1 caddy reload --config /etc/caddy/Caddyfile
   ```

### Issue: Backup Environment Not Healthy
**Symptoms**: Target environment fails health checks

**Solutions**:
1. **Start Backup Environment**:
   ```bash
   ./scripts/rollback.sh start-backup green
   ```

2. **Check Container Status**:
   ```bash
   docker compose -f deploy/docker-compose.blue-green.yml ps --services --filter "status=running"
   ```

3. **Review Container Logs**:
   ```bash
   docker compose -f deploy/docker-compose.blue-green.yml logs green-api-gateway
   ```

### Issue: Database Connection Problems
**Symptoms**: Services can't connect to database after rollback

**Solutions**:
1. **Check Database Health**:
   ```bash
   docker exec deploy-postgres-1 pg_isready
   ```

2. **Restart Database if Needed**:
   ```bash
   docker compose -f deploy/docker-compose.blue-green.yml restart postgres
   ```

3. **Verify Connection Pool**:
   ```bash
   docker exec deploy-postgres-1 psql -d flappyjournal -c "SELECT * FROM pg_stat_database WHERE datname='flappyjournal';"
   ```

### Issue: SSL/TLS Certificate Problems
**Symptoms**: HTTPS errors after rollback

**Solutions**:
1. **Check Caddy SSL Status**:
   ```bash
   docker exec deploy-caddy-1 caddy list-certificates
   ```

2. **Force Certificate Renewal**:
   ```bash
   docker exec deploy-caddy-1 caddy reload --config /etc/caddy/Caddyfile
   ```

---

## 📊 Post-Rollback Actions

### 1. Immediate Verification (0-15 minutes)
- [ ] **Health Checks**: All services responding correctly
- [ ] **User Testing**: Sample user workflows function properly
- [ ] **Performance**: Response times within acceptable limits
- [ ] **Monitoring**: Alerts cleared and metrics stable

### 2. Extended Monitoring (15-60 minutes)
- [ ] **Error Rates**: Monitor for any increase in errors
- [ ] **Performance Trends**: Watch for any degradation patterns
- [ ] **User Feedback**: Monitor support channels for issues
- [ ] **Resource Usage**: Ensure backup environment handles load

### 3. Investigation and Planning (1-24 hours)
- [ ] **Root Cause Analysis**: Determine what caused the need for rollback
- [ ] **Issue Documentation**: Create detailed incident report
- [ ] **Fix Planning**: Plan remediation for the original issue
- [ ] **Process Review**: Evaluate rollback effectiveness

### 4. Communication
- [ ] **Internal Update**: Notify team of rollback completion
- [ ] **User Communication**: Update status page if needed
- [ ] **Stakeholder Notification**: Inform relevant stakeholders
- [ ] **Documentation**: Update runbooks with lessons learned

---

## 📝 Rollback Log Templates

### Incident Report Template
```markdown
# Rollback Incident Report

**Date**: [Date and Time]
**Rollback Executor**: [Name]
**Affected Version**: v1.0-full-tech
**Rollback Target**: v0.9-backup

## Issue Summary
[Brief description of the issue that triggered rollback]

## Timeline
- [Time]: Issue first detected
- [Time]: Decision made to rollback
- [Time]: Rollback initiated
- [Time]: Rollback completed
- [Time]: Services verified

## Impact Assessment
- **Users Affected**: [Number/percentage]
- **Duration**: [How long issue persisted]
- **Services Impacted**: [List of affected services]

## Rollback Process
- **Method Used**: [Script/manual process]
- **Issues Encountered**: [Any problems during rollback]
- **Time to Complete**: [Duration]

## Root Cause
[Analysis of what caused the original issue]

## Action Items
- [ ] [Fix for original issue]
- [ ] [Process improvements]
- [ ] [Additional monitoring]

## Lessons Learned
[What we learned from this incident]
```

### Communication Template
```markdown
**Subject**: [RESOLVED] FlappyJournal Service Rollback Completed

Dear Team,

We have successfully completed a rollback of FlappyJournal from v1.0-full-tech to v0.9-backup due to [reason].

**Status**: ✅ Resolved
**Rollback Time**: [Duration]
**Current Version**: v0.9-backup
**Impact**: [Brief impact description]

All services are now operating normally. We will conduct a thorough investigation and provide an updated deployment timeline.

**Next Steps**:
1. Root cause analysis
2. Issue remediation
3. Updated deployment plan

For questions, please contact the DevOps team.

Best regards,
DevOps Team
```

---

## 🚀 Recovery and Re-deployment

### Preparing for Re-deployment

After successful rollback and issue resolution:

1. **Fix Root Cause**: Address the underlying issue
2. **Enhanced Testing**: Add tests to prevent regression
3. **Staging Validation**: Thoroughly test on staging environment
4. **Gradual Rollout**: Consider phased deployment approach

### Re-deployment Checklist
- [ ] **Issue Resolution**: Root cause fixed and tested
- [ ] **Code Review**: Changes peer reviewed
- [ ] **Testing**: All tests pass including new regression tests
- [ ] **Staging**: Full validation on staging environment
- [ ] **Documentation**: Updated deployment and rollback procedures
- [ ] **Monitoring**: Enhanced monitoring for previous failure points
- [ ] **Communication**: Team aware of re-deployment plan

---

## 📞 Emergency Contacts

### Critical Issues (24/7)
- **DevOps Lead**: [Contact information]
- **System Administrator**: [Contact information]
- **On-call Engineer**: [Contact information]

### Business Hours
- **Product Manager**: [Contact information]
- **Development Lead**: [Contact information]
- **QA Lead**: [Contact information]

### External Services
- **Hosting Provider (Linode)**: [Support contact]
- **DNS Provider (Cloudflare)**: [Support contact]
- **Monitoring Service**: [Support contact]

---

## 🔗 Additional Resources

### Documentation
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Monitoring Guide](./monitoring/README.md)
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)
- [Architecture Overview](./Target-Architecture.md)

### Monitoring and Status
- **Production Status**: https://app.featherweight.world/api/health
- **Grafana Dashboards**: https://monitoring.featherweight.world
- **Error Tracking**: [Error tracking service URL]

### Scripts and Tools
- **Deployment Script**: `./scripts/deploy-blue-green.sh`
- **Rollback Script**: `./scripts/rollback.sh`
- **Promotion Script**: `./scripts/promote.sh`
- **Health Check Script**: `./scripts/health-check.sh`

---

**Last Updated**: July 4, 2025  
**Document Version**: 1.0  
**Next Review**: July 11, 2025

Remember: When in doubt, prioritize user experience and system stability. It's better to rollback quickly and investigate thoroughly than to leave users with a degraded experience.
