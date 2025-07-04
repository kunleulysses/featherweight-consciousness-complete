import { KeycloakAdminClient } from './auth-service/keycloak-config.js';

async function setupKeycloak() {
  const config = {
    serverUrl: 'http://localhost:8082',
    realm: 'featherweight',
    clientId: 'featherweight-frontend',
    adminUsername: 'admin',
    adminPassword: 'admin123'
  };

  const keycloakAdmin = new KeycloakAdminClient(config);

  try {
    console.log('Creating realm...');
    await keycloakAdmin.createRealm('featherweight');
    console.log('Realm created successfully');

    console.log('Creating roles...');
    await keycloakAdmin.createRealmRole({
      name: 'admin',
      description: 'Admin role'
    });
    await keycloakAdmin.createRealmRole({
      name: 'researcher',
      description: 'Researcher role'
    });
    await keycloakAdmin.createRealmRole({
      name: 'collaborator',
      description: 'Collaborator role'
    });
    await keycloakAdmin.createRealmRole({
      name: 'viewer',
      description: 'Viewer role'
    });
    console.log('Roles created successfully');

    console.log('Creating client...');
    await keycloakAdmin.createClient({
      clientId: 'featherweight-frontend',
      name: 'Featherweight Frontend',
      description: 'Frontend client for Featherweight app',
      enabled: true,
      publicClient: true,
      protocol: 'openid-connect',
      redirectUris: [
        'https://app.featherweight.world/auth/callback',
        'http://localhost:3000/auth/callback'
      ],
      webOrigins: [
        'https://app.featherweight.world',
        'http://localhost:3000'
      ],
      standardFlowEnabled: true,
      implicitFlowEnabled: false,
      directAccessGrantsEnabled: false,
      serviceAccountsEnabled: false,
      authorizationServicesEnabled: false,
      frontchannelLogout: true,
      attributes: {
        'access.token.lifespan': '1800',
        'client.secret.creation.time': '0'
      }
    });
    console.log('Client created successfully');

    console.log('Setup complete!');
  } catch (error) {
    console.error('Setup failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

setupKeycloak();
