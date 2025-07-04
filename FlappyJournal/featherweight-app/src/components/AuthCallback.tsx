import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const { handleLoginCallback } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Log the current URL for debugging
        console.log('Auth callback URL:', window.location.href);
        console.log('URL params:', window.location.search);
        
        // Check for errors in URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('error')) {
          const error = urlParams.get('error');
          const errorDescription = urlParams.get('error_description');
          console.error('Auth error:', error, errorDescription);
          setError(`Authentication failed: ${error} - ${errorDescription}`);
          setTimeout(() => navigate('/login', { replace: true }), 3000);
          return;
        }
        
        console.log('Processing auth callback...');
        await handleLoginCallback();
        console.log('Auth callback successful, redirecting to home...');
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Auth callback failed:', error);
        setError(`Authentication failed: ${error}`);
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    };

    processCallback();
  }, [handleLoginCallback, navigate]);

  return (
    <div className="loading-container">
      {error ? (
        <>
          <p style={{ color: 'red' }}>{error}</p>
          <p>Redirecting to login...</p>
        </>
      ) : (
        <>
          <div className="loading-spinner"></div>
          <p>Completing authentication...</p>
        </>
      )}
    </div>
  );
}
