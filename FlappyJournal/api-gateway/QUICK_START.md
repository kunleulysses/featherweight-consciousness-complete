# API Gateway Quick Start Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd /opt/featherweight/FlappyJournal/api-gateway
npm install
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit configuration (optional - defaults work for local development)
nano .env
```

### 3. Start the Gateway
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The gateway will start on **http://localhost:4000**

### 4. Verify Installation
```bash
# Test gateway health
curl http://localhost:4000/health

# View API documentation
open http://localhost:4000/api/docs

# Test rate limiting headers
curl -I http://localhost:4000/health
```

## 📋 Key Endpoints

| Endpoint | Purpose | Authentication |
|----------|---------|----------------|
| `GET /health` | Gateway health check | None |
| `GET /ready` | Service readiness check | None |
| `GET /api/docs` | OpenAPI documentation | None |
| `POST /api/auth/login` | User authentication | None |
| `GET /api/journal/*` | Journal operations | JWT Required |
| `WS /ws/chat` | Chat WebSocket | JWT Required |

## 🔑 Authentication

### Using JWT Tokens
```bash
# Get token from auth service
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}' | jq -r '.token')

# Use token for protected endpoints
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/journal/entries
```

## 🛡️ Security Features

- **Rate Limiting**: 100 requests per 5 minutes per IP
- **CORS**: Configured for https://app.featherweight.world
- **JWT Validation**: Express-jwt middleware
- **Security Headers**: Helmet.js protection

## 🔧 Troubleshooting

### Common Issues

1. **Port 4000 already in use**
   ```bash
   # Check what's using port 4000
   lsof -i :4000
   
   # Change port in .env file
   echo "GATEWAY_PORT=4001" >> .env
   ```

2. **JWT validation failing**
   - Ensure Keycloak is running on port 8080
   - Check KEYCLOAK_SERVER_URL in .env
   - For development, simple tokens are supported

3. **Service connectivity issues**
   - Verify downstream services are running
   - Check service URLs in .env file
   - Use `/ready` endpoint to check service health

### Logs
```bash
# View real-time logs
npm run dev

# Check service health
curl http://localhost:4000/ready
```

## 📊 Monitoring

### Rate Limit Headers
```bash
curl -I http://localhost:4000/api/journal/test
# Look for:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 99
# X-RateLimit-Reset: 1625097600
```

### Health Monitoring
```bash
# Gateway health
curl http://localhost:4000/health

# All services health
curl http://localhost:4000/ready
```

## 🌐 Production Deployment

### Environment Variables
```bash
NODE_ENV=production
GATEWAY_PORT=4000
CORS_ORIGIN=https://app.featherweight.world
KEYCLOAK_SERVER_URL=https://auth.yourdomain.com
# ... other production configs
```

### Process Management
```bash
# Using PM2
npm install -g pm2
pm2 start ecosystem.config.js

# Using systemd
sudo systemctl start api-gateway
sudo systemctl enable api-gateway
```

---

🎯 **All requirements from Step 7 have been successfully implemented!**

The API Gateway is now ready to handle:
- REST API routing to microservices
- WebSocket chat connections 
- JWT-based authentication
- Rate limiting and CORS protection
- Comprehensive API documentation
