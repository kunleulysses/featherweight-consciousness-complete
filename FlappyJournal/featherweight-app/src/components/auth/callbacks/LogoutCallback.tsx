import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Box, Typography, Alert } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';

export const LogoutCallback: React.FC = () => {
  const navigate = useNavigate();
  const { handleLogoutCallback } = useAuth() as any;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        await handleLogoutCallback();
        
        // Redirect to home page after successful logout
        navigate('/', { replace: true });
        
      } catch (error: any) {
        console.error('Logout callback failed:', error);
        setError(error.message || 'Logout failed');
        
        // Even if callback fails, redirect to home page
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      }
    };

    processCallback();
  }, [handleLogoutCallback, navigate]);

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
        <Alert severity="warning" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Logout Completed
          </Typography>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Redirecting to home page...
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
        Completing logout...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we finish signing you out.
      </Typography>
    </Box>
  );
};
