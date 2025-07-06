import axios from 'axios';
import { User } from '../types/auth';
import { oidcService } from './oidcService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://' + window.location.hostname + ':3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for session management
});

// Add token to requests using OIDC service
api.interceptors.request.use(async (config) => {
  try {
    const token = await oidcService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn('Failed to get access token:', error);
  }
  return config;
});

// Handle token refresh on 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token silently
        const refreshedUser = await oidcService.signinSilent();
        
        if (refreshedUser) {
          // Retry the original request with new token
          const newToken = await oidcService.getAccessToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Redirect to login
        await oidcService.signoutRedirect();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  // Get current user profile from backend
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.patch('/auth/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  // Sync OIDC user with backend
  async syncUserProfile(): Promise<User> {
    try {
      const response = await api.post('/auth/sync');
      return response.data;
    } catch (error) {
      console.error('Failed to sync user profile:', error);
      throw error;
    }
  },

  // Get user's projects
  async getUserProjects(): Promise<any[]> {
    try {
      const response = await api.get('/projects/my');
      return response.data;
    } catch (error) {
      console.error('Failed to get user projects:', error);
      throw error;
    }
  },

  // Get user's roles for a specific project
  async getProjectRoles(projectId: string): Promise<string[]> {
    try {
      const response = await api.get(`/projects/${projectId}/roles`);
      return response.data.roles || [];
    } catch (error) {
      console.error(`Failed to get project roles for ${projectId}:`, error);
      return [];
    }
  },

  // Check if user has specific permission
  async hasPermission(permission: string, resourceId?: string): Promise<boolean> {
    try {
      const params = resourceId ? { resourceId } : {};
      const response = await api.get(`/auth/permissions/${permission}`, { params });
      return response.data.hasPermission || false;
    } catch (error) {
      console.error(`Failed to check permission ${permission}:`, error);
      return false;
    }
  },

  // Refresh tokens (delegated to OIDC service)
  async refreshTokens(): Promise<void> {
    try {
      await oidcService.signinSilent();
    } catch (error) {
      console.error('Failed to refresh tokens:', error);
      throw error;
    }
  },

  // Logout (both OIDC and backend)
  async logout(): Promise<void> {
    try {
      // Logout from backend first
      try {
        await api.post('/auth/logout');
      } catch (error) {
        console.warn('Backend logout failed:', error);
        // Continue with OIDC logout even if backend fails
      }

      // Then logout from OIDC provider
      await oidcService.signoutRedirect();
    } catch (error) {
      console.error('Logout failed:', error);
      // Force local cleanup
      await oidcService.removeUser();
      throw error;
    }
  },

  // Get current access token
  async getAccessToken(): Promise<string | null> {
    return await oidcService.getAccessToken();
  },

  // Get current ID token
  async getIdToken(): Promise<string | null> {
    return await oidcService.getIdToken();
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    return await oidcService.isAuthenticated();
  },

  // Utility method to make authenticated API calls
  async apiCall<T>(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', url: string, data?: any): Promise<T> {
    try {
      const response = await api.request({
        method,
        url,
        data,
      });
      return response.data;
    } catch (error) {
      console.error(`API call failed: ${method} ${url}`, error);
      throw error;
    }
  },

  // Role and permission helpers
  async hasRole(role: string): Promise<boolean> {
    return await oidcService.hasRole(role);
  },

  async hasAnyRole(roles: string[]): Promise<boolean> {
    return await oidcService.hasAnyRole(roles);
  },

  async getProjectRolesByService(projectId: string): Promise<string[]> {
    return await oidcService.getProjectRoles(projectId);
  },
};

export default authService;
