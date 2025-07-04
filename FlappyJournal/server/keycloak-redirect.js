// Keycloak redirect handler
export function setupKeycloakRedirect(router) {
  // Handle Keycloak registration redirect
  router.get('/auth/register', (req, res) => {
    const keycloakUrl = process.env.KEYCLOAK_SERVER_URL || 'https://app.featherweight.world/auth';
    const realm = process.env.KEYCLOAK_REALM || 'featherweight';
    const clientId = process.env.KEYCLOAK_CLIENT_ID || 'featherweight-frontend';
    const redirectUri = encodeURIComponent('https://app.featherweight.world/journal');
    
    // Redirect to Keycloak registration page
    const registrationUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/registrations?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid`;
    
    res.redirect(registrationUrl);
  });

  // Handle Keycloak login redirect
  router.get('/auth/login', (req, res) => {
    const keycloakUrl = process.env.KEYCLOAK_SERVER_URL || 'https://app.featherweight.world/auth';
    const realm = process.env.KEYCLOAK_REALM || 'featherweight';
    const clientId = process.env.KEYCLOAK_CLIENT_ID || 'featherweight-frontend';
    const redirectUri = encodeURIComponent('https://app.featherweight.world/journal');
    
    // Redirect to Keycloak login page
    const loginUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid`;
    
    res.redirect(loginUrl);
  });
}
