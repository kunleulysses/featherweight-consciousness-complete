import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Box,
  Alert
} from '@mui/material';
import {
  AdminPanelSettings,
  Science,
  Group,
  Visibility
} from '@mui/icons-material';

import { RoleBasedRender, AdminOnly, ResearcherOrAdmin, ProjectMemberOnly } from '../rbac/RoleBasedRender';
import { useUserRoles, useActiveProject } from '../../hooks/useRbac';

export const RbacExample: React.FC = () => {
  const userRoles = useUserRoles();
  const activeProject = useActiveProject();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        RBAC Example Components
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This page demonstrates how Role-Based Access Control (RBAC) works in the application.
        Different content will be visible based on your roles and permissions.
      </Alert>

      <Stack spacing={3}>
        {/* User roles display */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Current Roles
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {userRoles.length > 0 ? (
                userRoles.map((role) => (
                  <Chip 
                    key={role} 
                    label={role} 
                    color="primary" 
                    icon={
                      role === 'admin' ? <AdminPanelSettings /> :
                      role === 'researcher' ? <Science /> :
                      role === 'collaborator' ? <Group /> :
                      <Visibility />
                    }
                  />
                ))
              ) : (
                <Typography color="text.secondary">No roles assigned</Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Admin only content */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Admin Only Section
            </Typography>
            <AdminOnly 
              fallback={
                <Alert severity="warning">
                  You need admin privileges to view this content.
                </Alert>
              }
            >
              <Alert severity="success">
                🎉 Welcome, Admin! You have full access to system administration features.
              </Alert>
              <Button variant="contained" color="error" sx={{ mt: 2 }}>
                Dangerous Admin Action
              </Button>
            </AdminOnly>
          </CardContent>
        </Card>

        {/* Researcher or Admin content */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Research Tools
            </Typography>
            <ResearcherOrAdmin
              fallback={
                <Alert severity="info">
                  Research tools are available to researchers and administrators only.
                </Alert>
              }
            >
              <Alert severity="success">
                📊 Access granted to research tools and data analysis features.
              </Alert>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button variant="contained">Data Analysis</Button>
                <Button variant="outlined">Export Results</Button>
                <Button variant="outlined">Advanced Tools</Button>
              </Stack>
            </ResearcherOrAdmin>
          </CardContent>
        </Card>

        {/* Role-specific rendering */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Role-Specific Content
            </Typography>
            
            <RoleBasedRender 
              requireRole="admin"
              fallback={<Typography color="text.secondary">Admin content hidden</Typography>}
            >
              <Alert severity="error" sx={{ mb: 2 }}>
                🚨 Admin Dashboard - System Status Critical
              </Alert>
            </RoleBasedRender>

            <RoleBasedRender 
              requireRole="researcher"
              fallback={<Typography color="text.secondary">Researcher content hidden</Typography>}
            >
              <Alert severity="info" sx={{ mb: 2 }}>
                🔬 Researcher Portal - New experiments available
              </Alert>
            </RoleBasedRender>

            <RoleBasedRender 
              requireAnyRole={['collaborator', 'researcher', 'admin']}
              fallback={<Typography color="text.secondary">Collaboration features require special access</Typography>}
            >
              <Alert severity="success" sx={{ mb: 2 }}>
                🤝 Collaboration Hub - Team features enabled
              </Alert>
            </RoleBasedRender>
          </CardContent>
        </Card>

        {/* Project-specific content */}
        {activeProject && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project: {activeProject.name}
              </Typography>
              
              <ProjectMemberOnly 
                projectId={activeProject.id}
                fallback={
                  <Alert severity="warning">
                    You are not a member of this project.
                  </Alert>
                }
              >
                <Alert severity="success">
                  ✅ Project access granted! You can view and contribute to this project.
                </Alert>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Project roles: {activeProject.roles.join(', ') || 'None'}
                </Typography>
              </ProjectMemberOnly>
            </CardContent>
          </Card>
        )}

        {/* Custom logic example */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Complex Permission Logic
            </Typography>
            
            <RoleBasedRender 
              requireAnyRole={['admin', 'researcher']}
              projectId={activeProject?.id}
              requireAnyProjectRole={['owner', 'admin']}
              logicalOperator="OR"
              fallback={
                <Alert severity="warning">
                  You need either (admin/researcher role) OR (project owner/admin role) to access this.
                </Alert>
              }
            >
              <Alert severity="success">
                🎯 Advanced features unlocked! You meet the complex permission requirements.
              </Alert>
            </RoleBasedRender>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};
