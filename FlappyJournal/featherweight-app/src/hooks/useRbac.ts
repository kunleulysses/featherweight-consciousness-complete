import { useMemo } from 'react';
import { useAppSelector } from '../store/hooks';

// Hook to check if user is signed in
export const useIsAuthenticated = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return isAuthenticated;
};

// Hook to get user roles
export const useUserRoles = () => {
  const { roles } = useAppSelector((state) => state.auth);
  return roles;
};

// Hook to check user permissions
export const useHasPermission = (permission: string) => {
  const { permissions } = useAppSelector((state) => state.auth);
  return permissions.includes(permission);
};

// Hook to check if user has specific role
export const useHasRole = (role: string) => {
  const { roles } = useAppSelector((state) => state.auth);
  return roles.includes(role);
};

// Hook to check if user has any of the specified roles
export const useHasAnyRole = (roles: string[]) => {
  const { roles: userRoles } = useAppSelector((state) => state.auth);
  return useMemo(() => roles.some((role) => userRoles.includes(role)), [userRoles, roles]);
};

// Hook for checking project-specific roles
export const useHasProjectRole = (projectId: string, role: string) => {
  const { projects } = useAppSelector((state) => state.project);
  const project = projects.find((p) => p.id === projectId);
  return project ? project.roles.includes(role) : false;
};

// Hook for checking any role in specific project
export const useHasAnyProjectRole = (projectId: string, roles: string[]) => {
  const { projects } = useAppSelector((state) => state.project);
  const project = projects.find((p) => p.id === projectId);
  return useMemo(() => {
    return project ? roles.some((role) => project.roles.includes(role)) : false;
  }, [project, roles]);
};

// Hook for getting current active project
export const useActiveProject = () => {
  const { activeProject } = useAppSelector((state) => state.project);
  return activeProject;
};

// Hook for checking if any project is active
export const useIsProjectActive = (projectId: string) => {
  const { activeProject } = useAppSelector((state) => state.project);
  return activeProject ? activeProject.id === projectId : false;
};
