import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box, Alert, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRoles?: string[];
  requireAnyRole?: string[];
  projectId?: string;
  requireProjectRoles?: string[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireRoles = [],
  requireAnyRole = [],
  projectId,
  requireProjectRoles = [],
  fallbackPath = '/login'
}) => {
  const { user, loading, hasRole, hasAnyRole, getProjectRoles } = useAuth() as any;
  const location = useLocation();
  const [authorizationLoading, setAuthorizationLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (loading || !user) {
        setAuthorizationLoading(false);
        return;
      }

      try {
        let isAuthorized = true;

        // Check realm roles
        if (requireRoles.length > 0) {
          for (const role of requireRoles) {
            const hasRequiredRole = await hasRole(role);
            if (!hasRequiredRole) {
              isAuthorized = false;
              break;
            }
          }
        }

        // Check if user has any of the specified roles
        if (isAuthorized && requireAnyRole.length > 0) {
          const hasAnyRequiredRole = await hasAnyRole(requireAnyRole);
          if (!hasAnyRequiredRole) {
            isAuthorized = false;
          }
        }

        // Check project-specific roles
        if (isAuthorized && projectId && requireProjectRoles.length > 0) {
          const projectRoles = await getProjectRoles(projectId);
          const hasProjectRole = requireProjectRoles.some(role => 
            projectRoles.includes(role)
          );
          
          if (!hasProjectRole) {
            isAuthorized = false;
          }
        }

        setAuthorized(isAuthorized);
      } catch (error) {
        console.error('Authorization check failed:', error);
        setAuthorized(false);
      } finally {
        setAuthorizationLoading(false);
      }
    };

    checkAuthorization();
  }, [
    user, 
    loading, 
    requireRoles, 
    requireAnyRole, 
    projectId, 
    requireProjectRoles,
    hasRole,
    hasAnyRole,
    getProjectRoles
  ]);

  // Show loading spinner while checking authentication or authorization
  if (loading || authorizationLoading) {
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

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Show unauthorized message if authenticated but not authorized
  if (!authorized) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        padding={3}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1">
            You don't have the required permissions to access this page.
          </Typography>
          {requireRoles.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Required roles: {requireRoles.join(', ')}
            </Typography>
          )}
          {requireAnyRole.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Required any of: {requireAnyRole.join(', ')}
            </Typography>
          )}
          {projectId && requireProjectRoles.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Project {projectId} requires: {requireProjectRoles.join(', ')}
            </Typography>
          )}
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
};

// Convenience components for common role requirements
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireRoles={['admin']}>
    {children}
  </ProtectedRoute>
);

export const ResearcherRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireAnyRole={['admin', 'researcher']}>
    {children}
  </ProtectedRoute>
);

export const CollaboratorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireAnyRole={['admin', 'researcher', 'collaborator']}>
    {children}
  </ProtectedRoute>
);

export const ProjectRoute: React.FC<{ 
  children: React.ReactNode;
  projectId: string;
  roles?: string[];
}> = ({ children, projectId, roles = ['member'] }) => (
  <ProtectedRoute projectId={projectId} requireProjectRoles={roles}>
    {children}
  </ProtectedRoute>
);
