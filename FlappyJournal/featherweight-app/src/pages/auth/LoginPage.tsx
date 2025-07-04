import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Alert,
  Divider,
  CircularProgress,
  Stack
} from '@mui/material';
import { Login as LoginIcon, PersonAdd as RegisterIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  const handleLogin = async () => {
    try {
      setError(null);
      setIsLoggingIn(true);
      
      // For OIDC, this will redirect to Keycloak
      await login('', ''); // No need for credentials in OIDC flow
    } catch (error: any) {
      setError(error.message || 'Login failed');
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async () => {
    try {
      setError(null);
      setIsLoggingIn(true);
      
      // Navigate to register page, which will redirect to Keycloak registration
      navigate('/register');
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Featherweight Journal
          </Typography>
          
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Welcome Back
          </Typography>
          
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
            Sign in to access your research journal and collaborate with your team.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={2} sx={{ width: '100%' }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={isLoggingIn ? <CircularProgress size={20} /> : <LoginIcon />}
              onClick={handleLogin}
              disabled={isLoggingIn}
              sx={{ py: 1.5 }}
            >
              {isLoggingIn ? 'Redirecting...' : 'Sign In'}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<RegisterIcon />}
              onClick={handleRegister}
              disabled={isLoggingIn}
              sx={{ py: 1.5 }}
            >
              Create New Account
            </Button>
          </Stack>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Secure authentication powered by Keycloak
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Your data is protected with enterprise-grade security
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};
