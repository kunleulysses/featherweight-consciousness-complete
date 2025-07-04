import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import { PersonAdd as RegisterIcon, Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleRegister = async () => {
    try {
      setError(null);
      setIsRegistering(true);
      
      // For OIDC, this will redirect to Keycloak registration
      await register({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
      });
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      setIsRegistering(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
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
            Create Account
          </Typography>
          
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
            Join the Featherweight community and start your research journey today.
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
              startIcon={isRegistering ? <CircularProgress size={20} /> : <RegisterIcon />}
              onClick={handleRegister}
              disabled={isRegistering}
              sx={{ py: 1.5 }}
            >
              {isRegistering ? 'Redirecting...' : 'Create Account'}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<LoginIcon />}
              onClick={handleBackToLogin}
              disabled={isRegistering}
              sx={{ py: 1.5 }}
            >
              Back to Sign In
            </Button>
          </Stack>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Secure registration powered by Keycloak
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};
