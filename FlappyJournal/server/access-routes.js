import express from 'express';
import { authenticateToken, optionalAuth } from './auth-middleware.js';
import {
  validateAccessCode,
  getAccessLogs,
  addAccessCode,
  getAccessStats,
} from './access-code-service.js';

const router = express.Router();

// Validate access code endpoint
router.post('/validate-access', validateAccessCode);

// Admin endpoints (require authentication)
router.get('/admin/access-logs', authenticateToken, getAccessLogs);
router.post('/admin/access-codes', authenticateToken, addAccessCode);
router.get('/admin/access-stats', authenticateToken, getAccessStats);

// Real auth endpoints
router.get('/auth/me', authenticateToken, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name || `${req.user.given_name || ''} ${req.user.family_name || ''}`.trim(),
    preferred_username: req.user.preferred_username,
    given_name: req.user.given_name,
    family_name: req.user.family_name,
    roles: req.user.roles,
    isAuthenticated: true
  });
});

// These endpoints are handled by Keycloak directly, but we provide info
router.post('/auth/login', (req, res) => {
  const keycloakUrl = process.env.KEYCLOAK_SERVER_URL || 'https://app.featherweight.world/auth';
  const realm = process.env.KEYCLOAK_REALM || 'featherweight';
  const clientId = process.env.KEYCLOAK_CLIENT_ID || 'featherweight-frontend';
  const redirectUri = encodeURIComponent('https://app.featherweight.world/journal');
  
  const loginUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20profile%20email`;
  
  res.json({
    success: true,
    redirect_url: loginUrl,
    message: 'Redirecting to Keycloak for login'
  });
});

router.post('/auth/register', (req, res) => {
  const keycloakUrl = process.env.KEYCLOAK_SERVER_URL || 'https://app.featherweight.world/auth';
  const realm = process.env.KEYCLOAK_REALM || 'featherweight';
  const clientId = process.env.KEYCLOAK_CLIENT_ID || 'featherweight-frontend';
  const redirectUri = encodeURIComponent('https://app.featherweight.world/journal');
  
  const registrationUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20profile%20email&kc_action=register`;
  
  res.json({
    success: true,
    redirect_url: registrationUrl,
    message: 'Redirecting to Keycloak for registration'
  });
});

router.post('/auth/logout', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Sync user profile from Keycloak token
router.post('/auth/sync', authenticateToken, (req, res) => {
  // Here you would typically sync the user data with your database
  // For now, just return the user info from the token
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name || `${req.user.given_name || ''} ${req.user.family_name || ''}`.trim(),
    preferred_username: req.user.preferred_username,
    given_name: req.user.given_name,
    family_name: req.user.family_name,
    roles: req.user.roles,
    isAuthenticated: true
  });
});

// Get user projects (mock for now)
router.get('/projects/my', authenticateToken, (req, res) => {
  res.json([]);
});

// Get project roles
router.get('/projects/:projectId/roles', authenticateToken, (req, res) => {
  const projectId = req.params.projectId;
  const projectRoles = req.user.projectRoles[projectId] || [];
  res.json({ roles: projectRoles });
});

// Check permissions
router.get('/auth/permissions/:permission', authenticateToken, (req, res) => {
  const permission = req.params.permission;
  const resourceId = req.query.resourceId;
  
  // Basic permission check based on roles
  let hasPermission = false;
  
  if (req.user.roles.includes('admin')) {
    hasPermission = true;
  } else if (permission === 'read' && req.user.roles.includes('viewer')) {
    hasPermission = true;
  } else if (permission === 'write' && req.user.roles.includes('collaborator')) {
    hasPermission = true;
  } else if (permission === 'research' && req.user.roles.includes('researcher')) {
    hasPermission = true;
  }
  
  res.json({ hasPermission });
});

export default router;

// OAuth callback handler for Keycloak
router.get('/journal', authenticateToken, (req, res) => {
  // If this is an OAuth callback from Keycloak, handle the code exchange
  if (req.query.code) {
    // In a real implementation, you would exchange the code for tokens here
    // For now, just redirect to remove the code from URL
    return res.redirect('/journal');
  }
  
  // Otherwise, serve the journal page
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Alternative callback endpoint
router.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (!code) {
    return res.redirect('/?error=no_code');
  }
  
  try {
    // Exchange code for tokens
    const tokenUrl = `${process.env.KEYCLOAK_SERVER_URL || 'https://app.featherweight.world/auth'}/realms/${process.env.KEYCLOAK_REALM || 'featherweight'}/protocol/openid-connect/token`;
    
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'https://app.featherweight.world/journal',
        client_id: process.env.KEYCLOAK_CLIENT_ID || 'featherweight-frontend',
      }),
    });
    
    if (tokenResponse.ok) {
      const tokens = await tokenResponse.json();
      // In a real app, you'd set session cookies here
      // For now, just redirect to journal
      res.redirect('/journal');
    } else {
      res.redirect('/?error=token_exchange_failed');
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/?error=callback_error');
  }
});
