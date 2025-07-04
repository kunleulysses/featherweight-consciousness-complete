import { Express } from 'express';
import { authService } from './auth-service';
import { authenticate, requireAdmin, requireProjectRole, AuthenticatedRequest } from './auth-middleware';

export function setupAuthRoutes(app: Express): void {
  // Setup Keycloak authentication routes
  authService.setupRoutes(app);

  // Health check endpoint for auth service
  app.get('/auth/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'authentication',
      timestamp: new Date().toISOString(),
      keycloak: {
        server: process.env.KEYCLOAK_SERVER_URL || 'http://localhost:8080',
        realm: process.env.KEYCLOAK_REALM || 'featherweight',
      },
    });
  });

  // Test protected endpoint
  app.get('/auth/test/protected', authenticate, (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    res.json({
      message: 'Access granted to protected resource',
      user: {
        id: user.sub,
        email: user.email,
        username: user.preferred_username,
        roles: user.realm_access?.roles || [],
      },
    });
  });

  // Test admin endpoint
  app.get('/auth/test/admin', requireAdmin, (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    res.json({
      message: 'Access granted to admin resource',
      user: {
        id: user.sub,
        email: user.email,
        username: user.preferred_username,
      },
    });
  });

  // Test project role endpoint
  app.get('/auth/test/project/:projectId/admin', 
    requireProjectRole(':projectId', 'admin'), 
    (req, res) => {
      const user = (req as AuthenticatedRequest).user;
      const { projectId } = req.params;
      
      res.json({
        message: `Access granted to project ${projectId} as admin`,
        user: {
          id: user.sub,
          email: user.email,
          username: user.preferred_username,
        },
        project: projectId,
      });
    }
  );

  // OIDC/OAuth2 endpoints for external integrations
  app.get('/auth/oidc/.well-known/openid_configuration', (req, res) => {
    const keycloakUrl = process.env.KEYCLOAK_SERVER_URL || 'http://localhost:8080';
    const realm = process.env.KEYCLOAK_REALM || 'featherweight';
    
    res.json({
      issuer: `${keycloakUrl}/realms/${realm}`,
      authorization_endpoint: `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth`,
      token_endpoint: `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`,
      userinfo_endpoint: `${keycloakUrl}/realms/${realm}/protocol/openid-connect/userinfo`,
      jwks_uri: `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`,
      end_session_endpoint: `${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout`,
      response_types_supported: ['code', 'id_token', 'token'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
    });
  });

  // Token introspection endpoint (for API Gateway)
  app.post('/auth/introspect', async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({
          error: 'missing_token',
          error_description: 'Token parameter is required',
        });
      }

      // This would typically validate the token against Keycloak
      // For now, return a placeholder response
      res.json({
        active: true,
        client_id: 'featherweight-app',
        scope: 'openid profile email',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
    } catch (error) {
      res.status(500).json({
        error: 'server_error',
        error_description: 'Token introspection failed',
      });
    }
  });
}
