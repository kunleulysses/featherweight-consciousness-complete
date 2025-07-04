# Featherweight API Gateway

A lightweight, production-ready API Gateway built with Node.js and Express for the Featherweight Journal application. This gateway provides centralized authentication, authorization, rate limiting, request logging, and CORS policies.

## Features

### 🔐 Authentication & Authorization
- **JWT Validation**: Validates JWT tokens on every request using JWKS from Keycloak
- **User Context Injection**: Injects user-id, email, roles, and project-scope headers to downstream services
- **Role-Based Access Control (RBAC)**: Support for realm and resource-specific roles
- **Project-Level Authorization**: Fine-grained access control for project-specific resources

### 🛡️ Security
- **Helmet**: Comprehensive security headers
- **CORS**: Configurable cross-origin resource sharing
- **Request Sanitization**: XSS protection and input sanitization
- **Request Size Limits**: Prevent DoS attacks from large payloads
- **IP Whitelisting**: Restrict access to sensitive endpoints

### 🚦 Rate Limiting
- **Dynamic Rate Limiting**: Different limits based on user roles (admin, premium, regular)
- **Redis-Backed**: Distributed rate limiting using Redis for scalability
- **Endpoint-Specific Limits**: Stricter limits for sensitive endpoints (auth, admin)
- **Progressive Delays**: Slow down middleware for gradual response delays

### 📊 Observability
- **Structured Logging**: Winston-based logging with correlation IDs
- **Request Tracking**: Comprehensive request/response logging
- **Health Checks**: Gateway and downstream service health monitoring
- **Error Tracking**: Detailed error logging and monitoring

### 🔄 Request Routing
- **Service Discovery**: Route requests to appropriate downstream services
- **Health-Aware Routing**: Circuit breaker pattern for unhealthy services
- **WebSocket Support**: Proxy WebSocket connections to appropriate services
- **Static File Serving**: Fallback to frontend for SPA routing

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │───▶│   API Gateway   │───▶│ Downstream      │
│                 │    │                 │    │ Services        │
│ • Frontend      │    │ • Auth          │    │ • Auth Service  │
│ • Mobile        │    │ • Rate Limiting │    │ • Journal API   │
│ • Third-party   │    │ • Logging       │    │ • WebSocket     │
└─────────────────┘    │ • Routing       │    │ • Frontend      │
                       └─────────────────┘    └─────────────────┘
                               │
                       ┌─────────────────┐
                       │     Redis       │
                       │ (Rate Limiting) │
                       └─────────────────┘
```

## Quick Start

### Prerequisites
- Node.js 18+
- Redis (for distributed rate limiting)
- Keycloak (for JWT validation)

### Installation

1. **Clone and Install Dependencies**
```bash
cd api-gateway
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Development**
```bash
npm run dev
```

4. **Production Build**
```bash
npm run build
npm start
```

### Docker Deployment

1. **Build and Run with Docker Compose**
```bash
docker-compose up -d
```

2. **Scale the Gateway**
```bash
docker-compose up -d --scale api-gateway=3
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GATEWAY_PORT` | Port for the gateway | `3000` |
| `NODE_ENV` | Environment | `development` |
| `KEYCLOAK_SERVER_URL` | Keycloak server URL | `http://localhost:8080` |
| `KEYCLOAK_REALM` | Keycloak realm | `featherweight` |
| `AUTH_SERVICE_URL` | Auth service URL | `http://localhost:8081` |
| `JOURNAL_SERVICE_URL` | Journal service URL | `http://localhost:5000` |
| `REDIS_HOST` | Redis host | `localhost` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000,http://localhost:3001` |

### Service Routes

| Route Pattern | Destination | Authentication | Rate Limiting |
|---------------|-------------|----------------|---------------|
| `/api/auth/*` | Auth Service | Optional | Strict (10/15min) |
| `/api/journal/public/*` | Journal Service | Optional | Dynamic |
| `/api/journal/admin/*` | Journal Service | Required + Admin Role | Strict (5/15min) |
| `/api/journal/projects/:id/*` | Journal Service | Required + Project Access | Dynamic |
| `/api/journal/*` | Journal Service | Required | Dynamic |
| `/api/ws/*` | WebSocket Service | Required | Dynamic |
| `/api/health` | Journal Service | None | None |
| `/*` | Frontend Service | None | Dynamic |

## API Documentation

### Authentication Headers

The gateway injects the following headers for downstream services:

```
x-user-id: "uuid-of-authenticated-user"
x-user-email: "user@example.com"
x-user-roles: ["user", "premium"]
x-user-projects: ["project-uuid-1", "project-uuid-2"]
x-user-project-roles: ["project-1:admin", "project-2:member"]
x-project-id: "current-project-uuid" (for project-specific routes)
x-request-id: "correlation-id-for-tracing"
```

### Health Endpoints

#### Gateway Health
```bash
GET /health
```
Returns gateway status and configuration.

#### Readiness Check
```bash
GET /ready
```
Checks gateway and all downstream services health.

### Rate Limiting Headers

```
x-ratelimit-limit: 100
x-ratelimit-remaining: 85
x-ratelimit-reset: 1640995200
```

## Security Considerations

### JWT Validation
- Uses JWKS endpoint from Keycloak for key rotation
- Validates audience, issuer, and expiration
- Caches signing keys for performance

### Rate Limiting Strategy
- **Anonymous users**: 100 requests/15 min
- **Authenticated users**: 100 requests/15 min
- **Premium users**: 500 requests/15 min
- **Admin users**: No limits
- **Auth endpoints**: 10 requests/15 min
- **Admin endpoints**: 5 requests/15 min

### CORS Policy
- Configurable allowed origins
- Credentials support for authenticated requests
- Pre-flight request handling

## Monitoring & Logging

### Log Levels
- **Error**: System errors, authentication failures
- **Warn**: Rate limit exceeded, validation failures
- **Info**: Successful requests, health checks
- **Debug**: Detailed request/response information

### Metrics
- Request count and response times
- Rate limiting violations
- Authentication success/failure rates
- Downstream service health status

### Log Format
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
  "userEmail": "user@example.com",
  "requestId": "req-123456789"
}
```

## Development

### Project Structure
```
src/
├── config/           # Configuration management
├── middleware/       # Express middleware
│   ├── auth.ts      # Authentication & authorization
│   ├── rateLimiter.ts # Rate limiting logic
│   ├── requestLogger.ts # Request logging
│   ├── cors.ts      # CORS configuration
│   ├── security.ts  # Security middleware
│   └── proxy.ts     # Service routing & proxying
├── utils/           # Utility functions
│   └── logger.ts    # Winston logger setup
└── index.ts         # Main application entry point
```

### Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Contributing

1. Follow TypeScript best practices
2. Add comprehensive logging for new features
3. Update documentation for configuration changes
4. Include health checks for new dependencies

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure proper JWT secrets
- [ ] Set up Redis cluster for high availability
- [ ] Configure proper CORS origins
- [ ] Set up log aggregation (ELK, Splunk, etc.)
- [ ] Configure monitoring and alerting
- [ ] Set up load balancer with health checks
- [ ] Enable HTTPS termination
- [ ] Configure firewall rules

### Docker Production

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  api-gateway:
    image: featherweight/api-gateway:latest
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    environment:
      - NODE_ENV=production
    # ... other configuration
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: featherweight/api-gateway:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: REDIS_HOST
          value: "redis-service"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Troubleshooting

### Common Issues

1. **JWT Validation Failures**
   - Check Keycloak server URL and realm configuration
   - Verify JWKS endpoint accessibility
   - Check token audience and issuer claims

2. **Rate Limiting Issues**
   - Verify Redis connectivity
   - Check rate limit configuration
   - Review user role assignments

3. **CORS Errors**
   - Verify allowed origins configuration
   - Check pre-flight request handling
   - Review credentials settings

4. **Service Routing Issues**
   - Check downstream service URLs
   - Verify service health endpoints
   - Review proxy configuration

### Debug Mode

Set `LOG_LEVEL=debug` for detailed request/response logging:

```bash
LOG_LEVEL=debug npm run dev
```

## License

MIT License - see LICENSE file for details.
