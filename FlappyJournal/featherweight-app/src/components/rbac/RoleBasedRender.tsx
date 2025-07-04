import React from 'react';
import { useHasRole, useHasAnyRole, useHasProjectRole, useHasAnyProjectRole } from '../../hooks/useRbac';

interface RoleBasedRenderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  
  // Role-based rendering
  requireRole?: string;
  requireAnyRole?: string[];
  
  // Project-based rendering
  projectId?: string;
  requireProjectRole?: string;
  requireAnyProjectRole?: string[];
  
  // Logical operators
  logicalOperator?: 'AND' | 'OR';
}

export const RoleBasedRender: React.FC<RoleBasedRenderProps> = ({
  children,
  fallback = null,
  requireRole,
  requireAnyRole = [],
  projectId,
  requireProjectRole,
  requireAnyProjectRole = [],
  logicalOperator = 'AND'
}) => {
  const hasRole = useHasRole(requireRole || '');
  const hasAnyRole = useHasAnyRole(requireAnyRole);
  const hasProjectRole = useHasProjectRole(projectId || '', requireProjectRole || '');
  const hasAnyProjectRole = useHasAnyProjectRole(projectId || '', requireAnyProjectRole);

  // Build array of conditions to check
  const conditions: boolean[] = [];

  if (requireRole) {
    conditions.push(hasRole);
  }

  if (requireAnyRole.length > 0) {
    conditions.push(hasAnyRole);
  }

  if (projectId && requireProjectRole) {
    conditions.push(hasProjectRole);
  }

  if (projectId && requireAnyProjectRole.length > 0) {
    conditions.push(hasAnyProjectRole);
  }

  // If no conditions specified, render children by default
  if (conditions.length === 0) {
    return <>{children}</>;
  }

  // Apply logical operator
  const hasAccess = logicalOperator === 'AND' 
    ? conditions.every(condition => condition)
    : conditions.some(condition => condition);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// Convenience components for common scenarios
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <RoleBasedRender requireRole="admin" fallback={fallback}>
    {children}
  </RoleBasedRender>
);

export const ResearcherOrAdmin: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <RoleBasedRender requireAnyRole={['admin', 'researcher']} fallback={fallback}>
    {children}
  </RoleBasedRender>
);

export const ProjectMemberOnly: React.FC<{ 
  children: React.ReactNode; 
  projectId: string;
  fallback?: React.ReactNode;
}> = ({ children, projectId, fallback }) => (
  <RoleBasedRender 
    projectId={projectId} 
    requireAnyProjectRole={['owner', 'admin', 'member']} 
    fallback={fallback}
  >
    {children}
  </RoleBasedRender>
);

export const ProjectOwnerOnly: React.FC<{ 
  children: React.ReactNode; 
  projectId: string;
  fallback?: React.ReactNode;
}> = ({ children, projectId, fallback }) => (
  <RoleBasedRender 
    projectId={projectId} 
    requireProjectRole="owner" 
    fallback={fallback}
  >
    {children}
  </RoleBasedRender>
);
