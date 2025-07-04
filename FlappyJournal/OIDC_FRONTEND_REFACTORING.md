# Frontend OIDC/OAuth Refactoring Summary

## Overview

This document outlines the refactoring of the frontend authentication system from localStorage mock tokens to a full OIDC/OAuth integration with Keycloak, including Role-Based Access Control (RBAC) implementation.

## Key Changes Made

### 1. OIDC Service Implementation (`src/services/oidcService.ts`)

- **Replaced**: localStorage token management
- **Added**: Full OIDC client using `oidc-client-ts`
- **Features**:
  - Automatic token renewal
  - Silent authentication 
  - Secure token storage in session storage
  - Integration with Keycloak identity provider
  - Role and permission extraction from JWT tokens

### 2. Updated Auth Context (`src/contexts/AuthContext.tsx`)

- **Replaced**: Form-based login/register with OIDC redirects
- **Added**: Event-driven authentication state management
- **Features**:
  - OIDC callback handling
  - Automatic token refresh
  - Real-time authentication state updates
  - RBAC helper methods

### 3. Protected Routes with RBAC (`src/components/auth/ProtectedRoute.tsx`)

- **Enhanced**: Basic authentication check with comprehensive RBAC
- **Added**: 
  - Role-based route protection
  - Project-specific permissions
  - Multiple authorization strategies
  - Convenience components for common patterns

### 4. Redux Store Integration (`src/store/`)

- **Added**: Persistent state management for:
  - User profile information
  - Active project context
  - User roles and permissions
  - Project memberships

### 5. OIDC Callback Components

- **LoginCallback**: Handles successful authentication redirects
- **LogoutCallback**: Handles post-logout cleanup
- **SilentCallback**: Manages background token renewal

### 6. RBAC UI Components (`src/components/rbac/`)

- **RoleBasedRender**: Conditional rendering based on roles/permissions
- **Convenience Components**: AdminOnly, ResearcherOrAdmin, ProjectMemberOnly
- **Custom Hooks**: useHasRole, useHasAnyRole, useActiveProject

## Authentication Flow

### 1. Initial Authentication
```
User clicks "Sign In" → 
Redirect to Keycloak → 
User authenticates → 
Redirect to /auth/callback → 
Process tokens → 
Navigate to intended page
```

### 2. Token Refresh
```
Token expires → 
Silent renewal attempt → 
Success: Continue session → 
Failure: Redirect to login
```

### 3. Logout
```
User clicks "Logout" → 
Call backend logout → 
Redirect to Keycloak logout → 
Clear local state → 
Redirect to home
```

## RBAC Implementation

### Role Hierarchy
1. **admin**: Full system access
2. **researcher**: Research tools and data access
3. **collaborator**: Project collaboration features
4. **viewer**: Read-only access

### Project-Level Permissions
- **owner**: Full project control
- **admin**: Project administration
- **member**: Standard project access
- **viewer**: Read-only project access

### Usage Examples

```tsx
// Component-level protection
<AdminOnly>
  <DangerousButton />
</AdminOnly>

// Route-level protection
<ProtectedRoute requireAnyRole={['admin', 'researcher']}>
  <ResearchPage />
</ProtectedRoute>

// Conditional rendering
<RoleBasedRender 
  projectId="project-123" 
  requireProjectRole="owner"
  fallback={<AccessDenied />}
>
  <ProjectSettings />
</RoleBasedRender>

// Hook-based checks
const canEdit = useHasAnyRole(['admin', 'researcher']);
const isProjectOwner = useHasProjectRole(projectId, 'owner');
```

## Security Improvements

### 1. Token Management
- **Before**: Plain text tokens in localStorage
- **After**: Secure HTTP-only cookies + sessionStorage for state
- **Benefits**: Protection against XSS attacks

### 2. Authentication State
- **Before**: Client-side only validation
- **After**: Server-side token validation with automatic refresh
- **Benefits**: Real-time session management

### 3. Authorization
- **Before**: No role-based access control
- **After**: Multi-level RBAC with project-specific permissions
- **Benefits**: Fine-grained access control

## Environment Configuration

```env
# Required environment variables
REACT_APP_KEYCLOAK_URL=http://localhost:8080
REACT_APP_KEYCLOAK_REALM=featherweight
REACT_APP_KEYCLOAK_CLIENT_ID=featherweight-frontend
REACT_APP_API_URL=http://localhost:3001/api
```

## Dependencies Added

```json
{
  "oidc-client-ts": "^3.0.1",
  "@reduxjs/toolkit": "^2.0.1",
  "react-redux": "^9.0.4", 
  "redux-persist": "^6.0.0"
}
```

## Migration Notes

### For Existing Users
1. Logout all users during deployment
2. Clear localStorage/sessionStorage
3. Users will need to re-authenticate via Keycloak

### For Developers
1. Update API calls to use new auth service
2. Replace direct localStorage access with Redux store
3. Use RBAC components instead of manual permission checks

## Testing Considerations

### Unit Tests
- Mock OIDC service for component testing
- Test RBAC components with different role combinations
- Verify Redux state management

### Integration Tests
- Test full authentication flow
- Verify token refresh mechanisms
- Test logout scenarios

### End-to-End Tests
- Complete user journey from login to protected features
- Role-based feature access verification
- Cross-browser compatibility

## Performance Optimizations

1. **Lazy Loading**: Auth callbacks only loaded when needed
2. **Memoization**: RBAC checks cached to prevent re-computation
3. **Selective Persistence**: Only critical state persisted to localStorage
4. **Background Refresh**: Silent token renewal prevents user interruption

## Future Enhancements

1. **Multi-Factor Authentication**: Extend OIDC flow for MFA
2. **Social Login**: Add Google/GitHub/Microsoft integration
3. **Session Analytics**: Track authentication patterns
4. **Advanced RBAC**: Attribute-based access control (ABAC)
5. **Offline Support**: Cached permissions for offline functionality

## Troubleshooting

### Common Issues
1. **Infinite Redirect Loop**: Check Keycloak client configuration
2. **Token Refresh Failures**: Verify refresh token settings
3. **CORS Errors**: Configure proper origins in Keycloak
4. **State Persistence**: Clear browser storage during development

### Debug Tools
- Browser DevTools → Application → Storage
- Network tab for OIDC requests
- Redux DevTools for state inspection
- Keycloak admin console for user management
