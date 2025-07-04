import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();

  const handleLogin = () => {
    // For Keycloak/OIDC login, we pass empty credentials
    // The actual authentication happens via redirect
    login('', '');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Featherweight</h1>
        <p>AI-Powered Research Assistant</p>
        <button onClick={handleLogin} className="login-button">
          Login with Keycloak
        </button>
      </div>
    </div>
  );
}
