import axios from 'axios';

export interface KeycloakConfig {
  serverUrl: string;
  realm: string;
  clientId: string;
  clientSecret?: string;
  adminUsername: string;
  adminPassword: string;
}

export interface KeycloakUser {
  id?: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  emailVerified?: boolean;
  credentials?: Array<{
    type: string;
    value: string;
    temporary: boolean;
  }>;
  attributes?: {
    projectRoles?: string[];
    projects?: string[];
    [key: string]: any;
  };
}

export interface KeycloakRealmRole {
  name: string;
  description?: string;
  attributes?: {
    projectLevel?: string[];
  };
}

export interface KeycloakClient {
  clientId: string;
  name?: string;
  description?: string;
  enabled: boolean;
  publicClient: boolean;
  protocol: string;
  redirectUris: string[];
  webOrigins: string[];
  standardFlowEnabled: boolean;
  implicitFlowEnabled: boolean;
  directAccessGrantsEnabled: boolean;
  serviceAccountsEnabled: boolean;
  authorizationServicesEnabled: boolean;
  frontchannelLogout: boolean;
  attributes?: {
    [key: string]: string;
  };
}

export class KeycloakAdminClient {
  private config: KeycloakConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: KeycloakConfig) {
    this.config = config;
  }

  private async getAdminToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${this.config.serverUrl}/realms/master/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'password',
          client_id: 'admin-cli',
          username: this.config.adminUsername,
          password: this.config.adminPassword,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in - 30) * 1000; // 30s buffer

      return this.accessToken;
    } catch (error) {
      console.error('Failed to get admin token:', error);
      throw new Error('Failed to authenticate with Keycloak admin');
    }
  }

  private async makeRequest(method: string, path: string, data?: any): Promise<any> {
    const token = await this.getAdminToken();
    
    try {
      const response = await axios({
        method,
        url: `${this.config.serverUrl}/admin/realms/${this.config.realm}${path}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data,
      });
      
      return response.data;
    } catch (error: any) {
      console.error(`Keycloak API error (${method} ${path}):`, error.response?.data || error.message);
      throw error;
    }
  }

  // Realm Management
  async createRealm(realmName: string): Promise<void> {
    const realmConfig = {
      realm: realmName,
      enabled: true,
      displayName: 'Featherweight Journal',
      displayNameHtml: '<strong>Featherweight Journal</strong>',
      registrationAllowed: true,
      registrationEmailAsUsername: true,
      rememberMe: true,
      verifyEmail: true,
      loginWithEmailAllowed: true,
      duplicateEmailsAllowed: false,
      resetPasswordAllowed: true,
      editUsernameAllowed: false,
      bruteForceProtected: true,
      permanentLockout: false,
      maxFailureWaitSeconds: 900,
      minimumQuickLoginWaitSeconds: 60,
      waitIncrementSeconds: 60,
      quickLoginCheckMilliSeconds: 1000,
      maxDeltaTimeSeconds: 43200,
      failureFactor: 30,
      requiredCredentials: ['password'],
      passwordPolicy: 'hashIterations(27500) and length(8) and notUsername',
      otpPolicyType: 'totp',
      otpPolicyAlgorithm: 'HmacSHA1',
      otpPolicyInitialCounter: 0,
      otpPolicyDigits: 6,
      otpPolicyLookAheadWindow: 1,
      otpPolicyPeriod: 30,
      sslRequired: 'external',
      attributes: {
        frontendUrl: process.env.KEYCLOAK_FRONTEND_URL || '',
      },
    };

    try {
      await axios.post(
        `${this.config.serverUrl}/admin/realms`,
        realmConfig,
        {
          headers: {
            'Authorization': `Bearer ${await this.getAdminToken()}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error: any) {
      if (error.response?.status !== 409) { // Realm already exists
        throw error;
      }
    }
  }

  // User Management
  async createUser(user: KeycloakUser): Promise<string> {
    const response = await this.makeRequest('POST', '/users', user);
    const location = response.headers?.location;
    return location ? location.split('/').pop() : '';
  }

  async getUser(userId: string): Promise<KeycloakUser | null> {
    try {
      return await this.makeRequest('GET', `/users/${userId}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<KeycloakUser | null> {
    const users = await this.makeRequest('GET', `/users?email=${encodeURIComponent(email)}`);
    return users.length > 0 ? users[0] : null;
  }

  async updateUser(userId: string, user: Partial<KeycloakUser>): Promise<void> {
    await this.makeRequest('PUT', `/users/${userId}`, user);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.makeRequest('DELETE', `/users/${userId}`);
  }

  async setUserPassword(userId: string, password: string, temporary = false): Promise<void> {
    await this.makeRequest('PUT', `/users/${userId}/reset-password`, {
      type: 'password',
      value: password,
      temporary,
    });
  }

  // Role Management
  async createRealmRole(role: KeycloakRealmRole): Promise<void> {
    await this.makeRequest('POST', '/roles', role);
  }

  async getRealmRoles(): Promise<KeycloakRealmRole[]> {
    return await this.makeRequest('GET', '/roles');
  }

  async assignRealmRoleToUser(userId: string, roleName: string): Promise<void> {
    const role = await this.makeRequest('GET', `/roles/${roleName}`);
    await this.makeRequest('POST', `/users/${userId}/role-mappings/realm`, [role]);
  }

  async removeRealmRoleFromUser(userId: string, roleName: string): Promise<void> {
    const role = await this.makeRequest('GET', `/roles/${roleName}`);
    await this.makeRequest('DELETE', `/users/${userId}/role-mappings/realm`, [role]);
  }

  async getUserRealmRoles(userId: string): Promise<KeycloakRealmRole[]> {
    return await this.makeRequest('GET', `/users/${userId}/role-mappings/realm`);
  }

  // Client Management
  async createClient(client: KeycloakClient): Promise<string> {
    const response = await this.makeRequest('POST', '/clients', client);
    const location = response.headers?.location;
    return location ? location.split('/').pop() : '';
  }

  async getClientByClientId(clientId: string): Promise<any> {
    const clients = await this.makeRequest('GET', `/clients?clientId=${encodeURIComponent(clientId)}`);
    return clients.length > 0 ? clients[0] : null;
  }

  // Custom project-level RBAC methods
  async assignProjectRole(userId: string, projectId: string, role: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    const projectRoles = user.attributes?.projectRoles || [];
    const projects = user.attributes?.projects || [];
    
    const roleKey = `${projectId}:${role}`;
    if (!projectRoles.includes(roleKey)) {
      projectRoles.push(roleKey);
    }
    
    if (!projects.includes(projectId)) {
      projects.push(projectId);
    }

    await this.updateUser(userId, {
      attributes: {
        ...user.attributes,
        projectRoles,
        projects,
      },
    });
  }

  async removeProjectRole(userId: string, projectId: string, role: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    const projectRoles = user.attributes?.projectRoles || [];
    const roleKey = `${projectId}:${role}`;
    
    const updatedRoles = projectRoles.filter(r => r !== roleKey);
    const remainingProjectRoles = updatedRoles.filter(r => r.startsWith(`${projectId}:`));
    
    const projects = user.attributes?.projects || [];
    const updatedProjects = remainingProjectRoles.length > 0 
      ? projects 
      : projects.filter(p => p !== projectId);

    await this.updateUser(userId, {
      attributes: {
        ...user.attributes,
        projectRoles: updatedRoles,
        projects: updatedProjects,
      },
    });
  }

  async getUserProjectRoles(userId: string, projectId?: string): Promise<string[]> {
    const user = await this.getUser(userId);
    if (!user) return [];

    const projectRoles = user.attributes?.projectRoles || [];
    
    if (projectId) {
      return projectRoles
        .filter(role => role.startsWith(`${projectId}:`))
        .map(role => role.split(':')[1]);
    }
    
    return projectRoles;
  }
}
