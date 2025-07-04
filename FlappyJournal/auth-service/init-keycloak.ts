import { KeycloakAdminClient, KeycloakConfig } from './keycloak-config';

const config: KeycloakConfig = {
  serverUrl: process.env.KEYCLOAK_SERVER_URL || 'http://localhost:8080',
  realm: 'featherweight',
  clientId: 'featherweight-app',
  adminUsername: process.env.KEYCLOAK_ADMIN || 'admin',
  adminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin-secret-password',
};

export async function initializeKeycloak(): Promise<void> {
  const admin = new KeycloakAdminClient(config);

  try {
    console.log('🔐 Initializing Keycloak configuration...');

    // Create the featherweight realm
    console.log('📡 Creating Featherweight realm...');
    await admin.createRealm('featherweight');

    // Switch to the featherweight realm
    admin.config.realm = 'featherweight';

    // Create realm roles for project-level RBAC
    console.log('👥 Creating realm roles...');
    const roles = [
      { name: 'admin', description: 'Administrator with full access' },
      { name: 'editor', description: 'Editor with read/write access' },
      { name: 'viewer', description: 'Viewer with read-only access' },
      { name: 'user', description: 'Standard user access' },
      { name: 'premium', description: 'Premium user with enhanced features' },
    ];

    for (const role of roles) {
      try {
        await admin.createRealmRole(role);
        console.log(`  ✓ Created role: ${role.name}`);
      } catch (error: any) {
        if (error.response?.status === 409) {
          console.log(`  ⚠ Role already exists: ${role.name}`);
        } else {
          throw error;
        }
      }
    }

    // Create the main application client
    console.log('🔧 Creating application client...');
    const appClient = {
      clientId: 'featherweight-app',
      name: 'Featherweight Journal App',
      description: 'Main application client for Featherweight Journal',
      enabled: true,
      publicClient: false,
      protocol: 'openid-connect',
      redirectUris: [
        'http://localhost:3000/*',
        'http://localhost:5000/*',
        'https://app.featherweight.ai/*',
        'https://featherweight.ai/*',
      ],
      webOrigins: [
        'http://localhost:3000',
        'http://localhost:5000',
        'https://app.featherweight.ai',
        'https://featherweight.ai',
      ],
      standardFlowEnabled: true,
      implicitFlowEnabled: false,
      directAccessGrantsEnabled: true,
      serviceAccountsEnabled: true,
      authorizationServicesEnabled: true,
      frontchannelLogout: true,
      attributes: {
        'post.logout.redirect.uris': 'http://localhost:3000/logout+https://app.featherweight.ai/logout',
        'pkce.code.challenge.method': 'S256',
        'access.token.lifespan': '3600',
        'client.session.idle.timeout': '1800',
        'client.session.max.lifespan': '36000',
      },
    };

    try {
      await admin.createClient(appClient);
      console.log('  ✓ Created application client');
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log('  ⚠ Application client already exists');
      } else {
        throw error;
      }
    }

    // Create a public client for frontend applications
    console.log('🌐 Creating public client...');
    const publicClient = {
      clientId: 'featherweight-frontend',
      name: 'Featherweight Frontend',
      description: 'Public client for frontend applications',
      enabled: true,
      publicClient: true,
      protocol: 'openid-connect',
      redirectUris: [
        'http://localhost:3000/*',
        'https://app.featherweight.ai/*',
        'https://featherweight.ai/*',
      ],
      webOrigins: [
        'http://localhost:3000',
        'https://app.featherweight.ai',
        'https://featherweight.ai',
      ],
      standardFlowEnabled: true,
      implicitFlowEnabled: false,
      directAccessGrantsEnabled: false,
      serviceAccountsEnabled: false,
      authorizationServicesEnabled: false,
      frontchannelLogout: true,
      attributes: {
        'pkce.code.challenge.method': 'S256',
        'access.token.lifespan': '300',
      },
    };

    try {
      await admin.createClient(publicClient);
      console.log('  ✓ Created public client');
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log('  ⚠ Public client already exists');
      } else {
        throw error;
      }
    }

    // Create an API client for service-to-service communication
    console.log('🔌 Creating API client...');
    const apiClient = {
      clientId: 'featherweight-api',
      name: 'Featherweight API',
      description: 'Service client for API access',
      enabled: true,
      publicClient: false,
      protocol: 'openid-connect',
      redirectUris: [],
      webOrigins: [],
      standardFlowEnabled: false,
      implicitFlowEnabled: false,
      directAccessGrantsEnabled: false,
      serviceAccountsEnabled: true,
      authorizationServicesEnabled: true,
      frontchannelLogout: false,
      attributes: {
        'access.token.lifespan': '3600',
      },
    };

    try {
      await admin.createClient(apiClient);
      console.log('  ✓ Created API client');
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log('  ⚠ API client already exists');
      } else {
        throw error;
      }
    }

    console.log('✅ Keycloak initialization completed successfully!');
    console.log('\n📋 Configuration Summary:');
    console.log(`   Realm: ${config.realm}`);
    console.log(`   Server: ${config.serverUrl}`);
    console.log(`   Admin Console: ${config.serverUrl}/admin/`);
    console.log(`   Account Console: ${config.serverUrl}/realms/${config.realm}/account/`);
    console.log('\n🔑 Clients created:');
    console.log('   - featherweight-app (confidential)');
    console.log('   - featherweight-frontend (public)');
    console.log('   - featherweight-api (service)');
    console.log('\n👥 Roles created:');
    console.log('   - admin, editor, viewer, user, premium');

  } catch (error) {
    console.error('❌ Failed to initialize Keycloak:', error);
    throw error;
  }
}

// Run initialization if called directly
if (require.main === module) {
  initializeKeycloak()
    .then(() => {
      console.log('🎉 Keycloak setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}
