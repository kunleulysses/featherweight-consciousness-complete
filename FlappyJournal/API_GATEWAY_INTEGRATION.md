# API Gateway Integration Guide

This document describes the deployment and integration of the Featherweight API Gateway into the existing application architecture.

## Overview

The API Gateway has been implemented as a lightweight Node.js/Express service that provides:

✅ **JWT Validation** - Validates every request against Keycloak JWKS endpoint  
✅ **User Context Injection** - Adds user-id, email, roles, and project-scope headers to downstream services  
✅ **Centralized Rate Limiting** - Redis-backed rate limiting with role-based policies  
✅ **Request Logging** - Structured logging with correlation IDs  
✅ **CORS Policies** - Configurable cross-origin resource sharing  
✅ **Security Middleware** - Helmet, sanitization, request size limits  
✅ **Service Health Monitoring** - Circuit breaker pattern for downstream services  

## Architecture Integration

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│   API Gateway   │───▶│ Auth Service    │
│ (Port 3001)     │    │   (Port 3000)   │    │ (Port 8081)     │
└─────────────────┘    │                 │    └─────────────────┘
                       │ • JWT Validation│    ┌─────────────────┐
┌─────────────────┐    │ • Rate Limiting │───▶│ Journal Service │
│   Mobile Apps   │───▶│ • Logging       │    │ (Port 5000)     │
└─────────────────┘    │ • CORS          │    └─────────────────┘
                       │ • Routing       │    ┌─────────────────┐
┌─────────────────┐    │                 │───▶│ WebSocket       │
│   Third-party   │───▶│                 │    │ (Port 5001)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                       ┌─────────────────┐
                       │     Redis       │
                       │ (Rate Limiting) │
                       └─────────────────┘
```

## Deployment Steps

### 1. Install Dependencies

```bash
cd api-gateway
npm install
```

### 2. Configure Environment

```bash
cp api-gateway/.env.example api-gateway/.env
```

Edit the `.env` file with your specific configuration:

```env
# API Gateway Configuration
GATEWAY_PORT=3000
NODE_ENV=development

# Keycloak Integration (using existing auth setup)
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=featherweight

# Service URLs (adjust based on your setup)
AUTH_SERVICE_URL=http://localhost:8081
JOURNAL_SERVICE_URL=http://localhost:5000
WEBSOCKET_SERVICE_URL=http://localhost:5001
FRONTEND_SERVICE_URL=http://localhost:3001

# Rate Limiting
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,https://yourdomain.com
```

### 3. Start Redis (for Rate Limiting)

```bash
# Using Docker
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Or using Docker Compose
cd api-gateway
docker-compose up -d redis
```

### 4. Start the API Gateway

```bash
# Development mode
cd api-gateway
npm run dev

# Production mode
npm run build
npm start
```

## Service Integration

### Update Frontend Configuration

Update your frontend to point to the API Gateway instead of direct service calls:

```typescript
// Before (direct service calls)
const API_BASE = 'http://localhost:5000/api';
const AUTH_BASE = 'http://localhost:8081/auth';

// After (through API Gateway)
const API_BASE = 'http://localhost:3000/api/journal';
const AUTH_BASE = 'http://localhost:3000/api/auth';
```

### Update Service Headers

Your downstream services should now read user context from injected headers:

```typescript
// In your Journal Service (Express.js example)
app.use((req, res, next) => {
  // User context injected by API Gateway
  req.user = {
    id: req.headers['x-user-id'],
    email: req.headers['x-user-email'],
    roles: JSON.parse(req.headers['x-user-roles'] || '[]'),
    projects: JSON.parse(req.headers['x-user-projects'] || '[]'),
    projectRoles: JSON.parse(req.headers['x-user-project-roles'] || '[]'),
  };
  
  req.projectId = req.headers['x-project-id'];
  req.requestId = req.headers['x-request-id'];
  
  next();
});
```

## Docker Deployment

### Option 1: Add to Existing Docker Compose

Add the API Gateway to your existing `docker-compose.yml`:

```yaml
services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - KEYCLOAK_SERVER_URL=http://keycloak:8080
      - AUTH_SERVICE_URL=http://auth-service:8081
      - JOURNAL_SERVICE_URL=http://journal-service:5000
      - REDIS_HOST=redis
    depends_on:
      - redis
      - keycloak
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - app-network

volumes:
  redis-data:
```

### Option 2: Standalone Deployment

```bash
cd api-gateway
docker-compose up -d
```

## Load Balancer Integration

### Nginx Configuration

If using Nginx as a reverse proxy, update your configuration:

```nginx
upstream api_gateway {
    server 127.0.0.1:3000;
    # Add more instances for load balancing
    # server 127.0.0.1:3001;
    # server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name yourdomain.com;

    # API Gateway
    location / {
        proxy_pass http://api_gateway;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Health checks
    location /health {
        proxy_pass http://api_gateway/health;
        access_log off;
    }
}
```

## Monitoring Setup

### 1. Health Check Endpoints

```bash
# Gateway health
curl http://localhost:3000/health

# Readiness check (includes downstream services)
curl http://localhost:3000/ready
```

### 2. Log Aggregation

The gateway produces structured JSON logs. Configure your log aggregation:

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "info",
  "message": "HTTP Request",
  "method": "GET",
  "url": "/api/journal/entries",
  "status": 200,
  "responseTime": 45,
  "userId": "user-uuid",
  "requestId": "req-123456789"
}
```

### 3. Metrics Collection

Monitor these key metrics:
- Request count and response times
- Rate limiting violations
- Authentication success/failure rates
- Downstream service health

## Security Considerations

### 1. JWT Secret Management

Store JWT secrets securely:

```bash
# Using Docker secrets
echo "your-super-secret-key" | docker secret create jwt_secret -

# Using Kubernetes secrets
kubectl create secret generic api-gateway-secrets \
  --from-literal=jwt-secret=your-super-secret-key
```

### 2. Rate Limiting Configuration

Adjust rate limits based on your needs:

```env
# Conservative limits
RATE_LIMIT_MAX_REQUESTS=50
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes

# Liberal limits for high-traffic sites
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=300000  # 5 minutes
```

### 3. CORS Policy

Configure CORS restrictively for production:

```env
# Development
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Production
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com
CORS_CREDENTIALS=true
```

## Testing

### 1. Authentication Flow

```bash
# Get JWT token from auth service
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}' \
  | jq -r '.access_token')

# Use token for API calls
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/journal/entries
```

### 2. Rate Limiting

```bash
# Test rate limiting
for i in {1..105}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    http://localhost:3000/api/journal/entries
done
# Should return 429 after 100 requests
```

### 3. Health Checks

```bash
# Test health endpoints
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

## Migration Strategy

### Phase 1: Deploy Gateway (Parallel)
1. Deploy API Gateway alongside existing services
2. Test with a subset of traffic
3. Monitor logs and metrics

### Phase 2: Route Selection
1. Update frontend to use gateway for new features
2. Gradually migrate existing endpoints
3. Monitor authentication and rate limiting

### Phase 3: Full Migration
1. Route all traffic through gateway
2. Remove direct service access
3. Clean up old routing configuration

## Troubleshooting

### Common Issues

1. **JWT Validation Failures**
   ```bash
   # Check Keycloak connectivity
   curl http://localhost:8080/realms/featherweight/protocol/openid-connect/certs
   ```

2. **Rate Limiting Issues**
   ```bash
   # Check Redis connectivity
   redis-cli ping
   ```

3. **Service Routing Problems**
   ```bash
   # Check downstream service health
   curl http://localhost:5000/health
   curl http://localhost:8081/health
   ```

4. **CORS Errors**
   - Verify `CORS_ORIGIN` includes your frontend URL
   - Check browser developer tools for specific CORS errors

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug npm run dev
```

## Performance Optimization

### 1. Caching
- JWKS keys are cached for 10 minutes
- Rate limit counters use Redis with TTL
- Static assets can be cached at CDN level

### 2. Connection Pooling
- Enable HTTP keep-alive for downstream services
- Configure appropriate timeout values

### 3. Scaling
- Run multiple gateway instances behind load balancer
- Use Redis cluster for high availability
- Monitor resource usage and scale accordingly

## Maintenance

### 1. Log Rotation
Set up log rotation for production:

```bash
# logrotate configuration
/app/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 gateway gateway
}
```

### 2. Security Updates
- Regularly update dependencies
- Monitor security advisories
- Keep base Docker images updated

### 3. Monitoring Alerts
Set up alerts for:
- High error rates (>5%)
- Slow response times (>1s)
- Rate limiting violations
- Downstream service failures

This completes the API Gateway integration. The gateway is now ready to handle authentication, rate limiting, and request routing for your Featherweight Journal application.
