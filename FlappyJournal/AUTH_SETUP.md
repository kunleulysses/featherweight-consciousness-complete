# Featherweight Authentication & API Gateway Setup

This document describes the implementation of secure authentication and user management using Keycloak, Kong API Gateway, and JWT/OIDC tokens with project-level RBAC.

## Overview

The authentication system provides:

- ✅ **Keycloak Identity Provider** with email/password, social logins, and MFA
- ✅ **JWT/OIDC tokens** with custom claims for project-level RBAC
- ✅ **Kong API Gateway** for centralized routing and security
- ✅ **Database migrations** using Flyway-style scripts
- ✅ **Project-level role-based access control**
- ✅ **Backward compatibility** with graceful migration from legacy auth

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│   Kong Gateway   │───▶│   Application   │
│  (React/etc)    │    │   (Port 8000)    │    │   (Port 5000)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │    Keycloak      │
                       │   (Port 8080)    │
                       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   PostgreSQL     │
                       │   (Database)     │
                       └──────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
# Install additional auth dependencies
npm install jsonwebtoken@^9.0.2 jwks-rsa@^3.1.0 bcryptjs@^2.4.3 speakeasy@^2.0.0 qrcode@^1.5.3
npm install --save-dev @types/jsonwebtoken@^9.0.5 @types/bcryptjs@^2.4.6 @types/speakeasy@^2.0.10 @types/qrcode@^1.5.5
```

### 2. Configure Environment

```bash
# Copy authentication environment template
cp .env.auth.example .env.auth

# Edit the configuration file
nano .env.auth
```

### 3. Run Setup Script

```bash
# Run the complete authentication setup
./setup-auth.sh
```

### 4. Enable New Authentication

```bash
# Set environment variable to use new auth system
export USE_NEW_AUTH=true

# Start your application
npm run dev
```

## Manual Setup

If you prefer to set up components manually:

### 1. Start Services

```bash
# Start Keycloak, Kong, and supporting services
docker-compose -f docker-compose.auth.yml up -d
```

### 2. Initialize Keycloak

```bash
# Wait for Keycloak to be ready, then initialize
npm run auth:init
```

### 3. Configure Kong API Gateway

```bash
# Setup Kong routes and plugins
npm run kong:setup
```

### 4. Run Database Migrations

```bash
# Apply database schema changes
npm run migrate
```

## Configuration

### Environment Variables

Key environment variables for authentication:

```env
# Keycloak Configuration
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=featherweight
KEYCLOAK_CLIENT_ID=featherweight-app
KEYCLOAK_CLIENT_SECRET=your-client-secret

# Kong API Gateway
KONG_ADMIN_URL=http://localhost:8001
KONG_PROXY_URL=http://localhost:8000

# Application Settings
USE_NEW_AUTH=true
APP_BACKEND_URL=http://localhost:5000
```

### Social Login Setup

To enable social logins, configure identity providers in Keycloak:

1. Access Keycloak Admin Console: http://localhost:8080/admin/
2. Navigate to Identity Providers
3. Add Google, GitHub, Facebook providers with your credentials

## API Endpoints

### New Authentication Endpoints (Recommended)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/me` | Get current user info |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/social/{provider}` | Social login initiation |

### Legacy Endpoints (Deprecated)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/api/register` | Register new user | ⚠️ Deprecated |
| POST | `/api/login` | Login with email/password | ⚠️ Deprecated |
| POST | `/api/logout` | Logout user | ⚠️ Deprecated |
| GET | `/api/user` | Get current user info | ⚠️ Deprecated |

## Project-Level RBAC

The system supports project-level role-based access control:

### Default Roles

- **admin**: Full project access and management
- **editor**: Read/write access to project content
- **viewer**: Read-only access to project content
- **contributor**: Read/write access with commenting

### JWT Claims

Custom JWT claims for RBAC:

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "preferred_username": "username",
  "projects": ["project-1", "project-2"],
  "project_roles": ["project-1:admin", "project-2:editor"],
  "realm_access": {
    "roles": ["user", "premium"]
  }
}
```

### Middleware Usage

```typescript
import { authenticate, requireProjectRole } from './auth-middleware';

// Require authentication
app.get('/api/protected', authenticate, handler);

// Require specific project role
app.get('/api/projects/:id', 
  requireProjectRole(':id', 'viewer'), 
  handler
);

// Check roles programmatically
app.get('/api/projects/:id/edit', authenticate, (req, res) => {
  const { user } = req as AuthenticatedRequest;
  const projectId = req.params.id;
  
  if (hasProjectRole(user, projectId, 'editor')) {
    // Allow editing
  } else {
    res.status(403).json({ error: 'Insufficient permissions' });
  }
});
```

## Database Migrations

The system includes Flyway-style database migrations:

### Migration Files

- `V001__add_keycloak_integration.sql`: Keycloak user integration
- `V002__add_project_rbac.sql`: Project-level RBAC tables
- `V003__add_mfa_support.sql`: Multi-factor authentication

### Migration Commands

```bash
# Run pending migrations
npm run migrate

# Check migration status
npm run migrate:status

# Rollback last migration (destructive!)
npm run migrate:rollback
```

## Multi-Factor Authentication

The system supports multiple MFA methods:

### Supported Methods

- **TOTP**: Time-based One-Time Passwords (Google Authenticator, etc.)
- **SMS**: Text message verification via Twilio
- **Email**: Email-based verification codes
- **Backup Codes**: Recovery codes for account access

### MFA Configuration

1. Enable MFA in Keycloak realm settings
2. Configure TOTP, SMS, or email providers
3. Users can set up MFA in their account settings

## API Gateway Features

Kong API Gateway provides:

### Security Features

- **JWT Authentication**: Automatic token validation
- **Rate Limiting**: Prevent abuse and DoS attacks
- **CORS**: Cross-origin request handling
- **Request/Response Transformation**: Header manipulation

### Monitoring

- **Prometheus Metrics**: Performance and usage metrics
- **Access Logging**: Detailed request logging
- **Health Checks**: Service availability monitoring

### Gateway URLs

- Admin API: http://localhost:8001
- Manager UI: http://localhost:8002
- Proxy: http://localhost:8000

## Migration from Legacy Auth

### Automatic Migration

The system provides backward compatibility:

1. Set `USE_NEW_AUTH=false` to continue using legacy auth
2. Gradually migrate frontend to use `/auth/*` endpoints
3. Set `USE_NEW_AUTH=true` to switch to new system
4. Legacy endpoints return HTTP 410 (Gone) with migration instructions

### Data Migration

User data is automatically synchronized:

1. Existing users are created in Keycloak on first login
2. Database user records are updated with Keycloak user IDs
3. Project assignments are maintained

### Frontend Migration

Update your frontend authentication code:

```javascript
// Old (deprecated)
const response = await fetch('/api/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// New (recommended)
const response = await fetch('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
```

## Troubleshooting

### Common Issues

#### Keycloak Not Starting

```bash
# Check logs
docker-compose -f docker-compose.auth.yml logs keycloak

# Verify database connection
docker-compose -f docker-compose.auth.yml logs keycloak-db
```

#### Kong Configuration Issues

```bash
# Check Kong status
npm run kong:status

# View Kong logs
docker-compose -f docker-compose.auth.yml logs kong
```

#### JWT Token Issues

```bash
# Verify token validity
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/auth/me
```

### Debug Mode

Enable debug logging:

```env
LOG_LEVEL=debug
KEYCLOAK_LOG_LEVEL=DEBUG
```

## Security Considerations

### Production Deployment

For production deployment:

1. **Use HTTPS**: Enable SSL/TLS for all services
2. **Secure Secrets**: Use proper secret management
3. **Network Security**: Restrict database access
4. **Monitoring**: Set up comprehensive logging and alerting
5. **Backup**: Regular backups of Keycloak and user data

### Security Headers

The application includes security headers:

- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review Docker logs: `docker-compose -f docker-compose.auth.yml logs`
3. Verify service health: `curl http://localhost:8000/health`
4. Check Keycloak admin console: http://localhost:8080/admin/

## Next Steps

After setting up authentication:

1. **Configure Social Logins**: Set up Google, GitHub, Facebook
2. **Enable MFA**: Configure multi-factor authentication
3. **Set Up Monitoring**: Implement comprehensive monitoring
4. **Performance Tuning**: Optimize for your workload
5. **Security Audit**: Conduct security review and testing

---

**Note**: This authentication system provides enterprise-grade security and scalability. Take time to understand the configuration and customize it for your specific requirements.
