import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Box, Typography, Alert } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';

export const LoginCallback: React.FC = () => {
  const navigate = useNavigate();
  const { handleLoginCallback } = useAuth() as any;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const user = await handleLoginCallback();
        
        // Get the return URL from state (set during login redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const state = urlParams.get('state');
        
        // Navigate to intended page or dashboard
        const returnUrl = state || '/dashboard';
        navigate(returnUrl, { replace: true });
        
      } catch (error: any) {
        console.error('Login callback failed:', error);
        setError(error.message || 'Login failed');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    processCallback();
  }, [handleLoginCallback, navigate]);

  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        gap={2}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Login Failed
          </Typography>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Redirecting to login page...
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Completing login...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we set up your session.
      </Typography>
    </Box>
  );
};
