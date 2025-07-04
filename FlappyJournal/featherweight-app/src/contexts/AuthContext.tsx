import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as OidcUser } from 'oidc-client-ts';
import { User, AuthContextType, RegisterData } from '../types/auth';
import { oidcService } from '../services/oidcService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Check if user is already authenticated
        const oidcUser = await oidcService.getUser();
        
        if (oidcUser && !oidcUser.expired) {
          const appUser = oidcService.convertOidcUserToAppUser(oidcUser);
          setUser(appUser);
        } else if (oidcUser && oidcUser.expired) {
          // Try to renew silently
          try {
            const renewedUser = await oidcService.signinSilent();
            if (renewedUser) {
              const appUser = oidcService.convertOidcUserToAppUser(renewedUser);
              setUser(appUser);
            }
          } catch (error) {
            console.warn('Silent renewal failed:', error);
            await oidcService.removeUser();
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clean up any corrupted state
        await oidcService.removeUser();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up event listeners for OIDC events
    const userManager = oidcService.getUserManager();
    
    const handleUserLoaded = (oidcUser: OidcUser) => {
      const appUser = oidcService.convertOidcUserToAppUser(oidcUser);
      setUser(appUser);
    };

    const handleUserUnloaded = () => {
      setUser(null);
    };

    const handleAccessTokenExpired = () => {
      setUser(null);
    };

    const handleSilentRenewError = () => {
      setUser(null);
    };

    // Add event listeners
    userManager.events.addUserLoaded(handleUserLoaded);
    userManager.events.addUserUnloaded(handleUserUnloaded);
    userManager.events.addAccessTokenExpired(handleAccessTokenExpired);
    userManager.events.addSilentRenewError(handleSilentRenewError);

    // Cleanup event listeners
    return () => {
      userManager.events.removeUserLoaded(handleUserLoaded);
      userManager.events.removeUserUnloaded(handleUserUnloaded);
      userManager.events.removeAccessTokenExpired(handleAccessTokenExpired);
      userManager.events.removeSilentRenewError(handleSilentRenewError);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // For OIDC flow, we redirect to the identity provider
      // The email/password parameters might be used for kc_idp_hint or pre-filled forms
      const extraParams: Record<string, string> = {};
      
      if (email) {
        extraParams.login_hint = email;
      }
      
      console.log("Processing login callback...");
      await oidcService.signinRedirect(extraParams);
      // Note: This will redirect the browser, so execution won't continue here
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      
      // For OIDC flow, redirect to registration page
      // You might want to include registration data as query parameters
      const extraParams: Record<string, string> = {
        kc_action: 'register'
      };
      
      if (userData.email) {
        extraParams.login_hint = userData.email;
      }
      
      console.log("Processing login callback...");
      await oidcService.signinRedirect(extraParams);
      // Note: This will redirect the browser, so execution won't continue here
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setUser(null);
      await oidcService.signoutRedirect();
      // Note: This will redirect the browser, so execution won't continue here
    } catch (error) {
      setLoading(false);
      // Even if logout redirect fails, clear local state
      setUser(null);
      await oidcService.removeUser();
      throw error;
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      // For profile updates, you might need to call your backend API
      // The OIDC user profile is typically managed by the identity provider
      
      // For now, update local state (this won't persist across sessions)
      if (user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        
        // TODO: Call backend API to sync profile changes
        // await apiService.updateUserProfile(userData);
      }
    } catch (error) {
      throw error;
    }
  };

  // Helper method to handle login callback
  const handleLoginCallback = async (): Promise<User> => {
    try {
      setLoading(true);
      console.log("Processing login callback...");
      const oidcUser = await oidcService.signinRedirectCallback();
      const appUser = oidcService.convertOidcUserToAppUser(oidcUser);
      setUser(appUser);
      return appUser;
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Helper method to handle logout callback
  const handleLogoutCallback = async (): Promise<void> => {
    try {
      await oidcService.signoutRedirectCallback();
      setUser(null);
    } catch (error) {
      // Even if callback fails, ensure user is logged out locally
      setUser(null);
      await oidcService.removeUser();
      throw error;
    }
  };

  // RBAC helpers
  const hasRole = async (role: string): Promise<boolean> => {
    return await oidcService.hasRole(role);
  };

  const hasAnyRole = async (roles: string[]): Promise<boolean> => {
    return await oidcService.hasAnyRole(roles);
  };

  const getProjectRoles = async (projectId: string): Promise<string[]> => {
    return await oidcService.getProjectRoles(projectId);
  };

  const value: AuthContextType & {
    handleLoginCallback: () => Promise<User>;
    handleLogoutCallback: () => Promise<void>;
    hasRole: (role: string) => Promise<boolean>;
    hasAnyRole: (roles: string[]) => Promise<boolean>;
    getProjectRoles: (projectId: string) => Promise<string[]>;
  } = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    handleLoginCallback,
    handleLogoutCallback,
    hasRole,
    hasAnyRole,
    getProjectRoles
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
