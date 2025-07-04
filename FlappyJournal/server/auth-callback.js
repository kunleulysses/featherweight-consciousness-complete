// Enhanced auth callback handler
export function setupAuthCallback(router) {
  // Handle successful registration/login from Keycloak
  router.get('/auth/realms/featherweight/*', (req, res) => {
    // Redirect to the app after any Keycloak action
    res.redirect('/journal');
  });
  
  // Also handle the standard callback
  router.get('/auth/callback', (req, res) => {
    const { code, state, error } = req.query;
    
    if (error) {
      console.error('Auth callback error:', error);
      return res.redirect('/?error=' + error);
    }
    
    if (!code) {
      return res.redirect('/');
    }
    
    // In a real implementation, exchange code for tokens
    // For now, just redirect to journal
    res.redirect('/journal');
  });
  
  // Handle any other auth-related redirects
  router.get('/auth/*', (req, res) => {
    // If it's not a known auth endpoint, redirect to home
    res.redirect('/');
  });
}
