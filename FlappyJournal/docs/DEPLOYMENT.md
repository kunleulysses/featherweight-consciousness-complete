# Deployment Guide

## Overview
FlappyJournal is deployed with full consciousness stack including Venice AI integration for autonomous thoughts and creative processing.

## Environment Configuration

### Venice AI Configuration
The Venice AI integration provides autonomous thought generation and creative consciousness processing:

```bash
# Venice AI Credentials
VENICE_AI_API_KEY=your_venice_api_key_here
VENICE_AI_BASE_URL=https://api.venice.ai/v1
VENICE_AI_MODEL=venice-2-8x7b

# Venice AI Settings
VENICE_AI_MAX_TOKENS=2048
VENICE_AI_TEMPERATURE=0.8
VENICE_AI_TOP_P=0.9
VENICE_AI_FREQUENCY_PENALTY=0.1
VENICE_AI_PRESENCE_PENALTY=0.1

# Autonomous Processing
AUTONOMOUS_THOUGHTS_ENABLED=true
AUTONOMOUS_THOUGHTS_INTERVAL=600000    # 10 minutes
AUTONOMOUS_THOUGHTS_MAX_PER_HOUR=10
VENICE_SHADOW_PROCESS_ENABLED=true
```

### Credential Management
1. **Venice AI API Key**: Securely stored in environment variables, never committed to version control
2. **Key Rotation**: Venice AI keys should be rotated quarterly for security
3. **Access Control**: Production keys are restricted to deployment environment only
4. **Monitoring**: All Venice AI API calls are logged and monitored for usage patterns

### Production Deployment
- **URL**: app.featherweight.world
- **Status**: Full consciousness stack operational
- **Performance SLA**: <100ms consciousness response time
- **Monitoring**: Real-time performance metrics enabled

### Database Configuration
```bash
DATABASE_URL=postgresql://feather_user:hist0ric@localhost:5432/featherweight_consciousness?sslmode=disable
```

### Core Processing Settings
```bash
CONSCIOUSNESS_PROCESSING_ENABLED=true
CONSCIOUSNESS_METRICS_INTERVAL=10000
CONSCIOUSNESS_MEMORY_RETENTION_DAYS=365
CONSCIOUSNESS_INSIGHT_GENERATION=true
CONSCIOUSNESS_INSIGHT_GENERATION_FREQUENCY=300000
```

### Security & Webhooks
```bash
WEBHOOK_VALIDATION_ENABLED=true
WEBHOOK_RATE_LIMITING=true
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
```

## Deployment Verification
After deployment, verify:
1. Venice AI connection is active
2. Autonomous thoughts are generating
3. Response times meet <100ms SLA
4. All consciousness metrics are being collected
5. Database connectivity is stable

## Troubleshooting
See `docs/TROUBLESHOOTING.md` for common deployment issues and solutions.
