import axios from 'axios';

interface KongService {
  name: string;
  url: string;
  protocol?: string;
  host?: string;
  port?: number;
  path?: string;
}

interface KongRoute {
  name: string;
  service: { name: string };
  paths: string[];
  methods?: string[];
  strip_path?: boolean;
  preserve_host?: boolean;
}

interface KongPlugin {
  name: string;
  service?: { name: string };
  route?: { name: string };
  config: Record<string, any>;
}

export class KongSetup {
  private kongAdminUrl: string;

  constructor() {
    this.kongAdminUrl = process.env.KONG_ADMIN_URL || 'http://localhost:8001';
  }

  private async makeRequest(method: string, path: string, data?: any): Promise<any> {
    try {
      const response = await axios({
        method,
        url: `${this.kongAdminUrl}${path}`,
        headers: {
          'Content-Type': 'application/json',
        },
        data,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        // Resource already exists, which is fine for our setup
        return error.response.data;
      }
      console.error(`Kong API error (${method} ${path}):`, error.response?.data || error.message);
      throw error;
    }
  }

  async createService(service: KongService): Promise<void> {
    await this.makeRequest('POST', '/services', service);
  }

  async createRoute(route: KongRoute): Promise<void> {
    await this.makeRequest('POST', '/routes', route);
  }

  async createPlugin(plugin: KongPlugin): Promise<void> {
    await this.makeRequest('POST', '/plugins', plugin);
  }

  async setupFeatherweightGateway(): Promise<void> {
    console.log('🚀 Setting up Kong API Gateway for Featherweight...');

    try {
      // Create main application service
      console.log('📡 Creating main application service...');
      await this.createService({
        name: 'featherweight-app',
        url: process.env.APP_BACKEND_URL || 'http://localhost:5000',
      });

      // Create authentication service
      console.log('🔐 Creating authentication service...');
      await this.createService({
        name: 'featherweight-auth',
        url: process.env.KEYCLOAK_SERVER_URL || 'http://localhost:8080',
      });

      // Create routes for main application
      console.log('🛣️  Creating application routes...');
      
      // API routes (protected)
      await this.createRoute({
        name: 'app-api',
        service: { name: 'featherweight-app' },
        paths: ['/api'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        strip_path: false,
        preserve_host: true,
      });

      // Public routes (unprotected)
      await this.createRoute({
        name: 'app-public',
        service: { name: 'featherweight-app' },
        paths: ['/public', '/health'],
        methods: ['GET', 'POST'],
        strip_path: false,
        preserve_host: true,
      });

      // Authentication routes
      await this.createRoute({
        name: 'auth-routes',
        service: { name: 'featherweight-app' },
        paths: ['/auth'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        strip_path: false,
        preserve_host: true,
      });

      // Keycloak routes
      await this.createRoute({
        name: 'keycloak-routes',
        service: { name: 'featherweight-auth' },
        paths: ['/realms', '/admin'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        strip_path: false,
        preserve_host: true,
      });

      // Setup CORS plugin for all routes
      console.log('🌐 Setting up CORS plugin...');
      await this.createPlugin({
        name: 'cors',
        config: {
          origins: [
            'http://localhost:3000',
            'https://app.featherweight.ai',
            'https://featherweight.ai',
          ],
          methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
          headers: ['Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'Authorization'],
          exposed_headers: ['X-Auth-Token'],
          credentials: true,
          max_age: 3600,
        },
      });

      // Setup rate limiting for API routes
      console.log('⏱️  Setting up rate limiting...');
      await this.createPlugin({
        name: 'rate-limiting',
        route: { name: 'app-api' },
        config: {
          minute: 100,
          hour: 1000,
          policy: 'local',
        },
      });

      // Setup JWT authentication for API routes
      console.log('🔑 Setting up JWT authentication...');
      await this.createPlugin({
        name: 'jwt',
        route: { name: 'app-api' },
        config: {
          uri_param_names: ['jwt'],
          cookie_names: ['access_token'],
          header_names: ['authorization'],
          claims_to_verify: ['exp'],
          key_claim_name: 'iss',
          secret_is_base64: false,
          run_on_preflight: false,
        },
      });

      // Setup request logging
      console.log('📝 Setting up request logging...');
      await this.createPlugin({
        name: 'file-log',
        config: {
          path: '/tmp/kong-access.log',
        },
      });

      // Setup Prometheus metrics
      console.log('📊 Setting up Prometheus metrics...');
      await this.createPlugin({
        name: 'prometheus',
        config: {
          per_consumer: true,
          status_code_metrics: true,
          latency_metrics: true,
          bandwidth_metrics: true,
          upstream_health_metrics: true,
        },
      });

      // Setup request transformer for auth headers
      console.log('🔄 Setting up request transformer...');
      await this.createPlugin({
        name: 'request-transformer',
        route: { name: 'app-api' },
        config: {
          add: {
            headers: ['X-Forwarded-User:$(X-Consumer-Username)'],
          },
        },
      });

      console.log('✅ Kong API Gateway setup completed successfully!');
      console.log('\n📋 Configuration Summary:');
      console.log(`   Kong Admin API: ${this.kongAdminUrl}`);
      console.log(`   Kong Proxy: http://localhost:8000`);
      console.log(`   Kong Manager: http://localhost:8002`);
      console.log('\n🛣️  Routes configured:');
      console.log('   - /api/* → featherweight-app (protected)');
      console.log('   - /auth/* → featherweight-app (public)');
      console.log('   - /public/* → featherweight-app (public)');
      console.log('   - /realms/* → keycloak (public)');
      console.log('\n🔌 Plugins enabled:');
      console.log('   - CORS, Rate Limiting, JWT Auth, Logging, Metrics');

    } catch (error) {
      console.error('❌ Failed to setup Kong API Gateway:', error);
      throw error;
    }
  }

  async createJWTCredential(consumerId: string, key: string, secret?: string): Promise<void> {
    await this.makeRequest('POST', `/consumers/${consumerId}/jwt`, {
      key,
      secret,
      algorithm: 'RS256',
    });
  }

  async getGatewayStatus(): Promise<any> {
    return await this.makeRequest('GET', '/status');
  }

  async listServices(): Promise<any> {
    return await this.makeRequest('GET', '/services');
  }

  async listRoutes(): Promise<any> {
    return await this.makeRequest('GET', '/routes');
  }

  async listPlugins(): Promise<any> {
    return await this.makeRequest('GET', '/plugins');
  }
}

// CLI usage
if (require.main === module) {
  const kong = new KongSetup();
  const command = process.argv[2];

  (async () => {
    try {
      switch (command) {
        case 'setup':
          await kong.setupFeatherweightGateway();
          break;
        case 'status':
          const status = await kong.getGatewayStatus();
          console.log('Kong Status:', JSON.stringify(status, null, 2));
          break;
        case 'list-services':
          const services = await kong.listServices();
          console.log('Services:', JSON.stringify(services, null, 2));
          break;
        case 'list-routes':
          const routes = await kong.listRoutes();
          console.log('Routes:', JSON.stringify(routes, null, 2));
          break;
        case 'list-plugins':
          const plugins = await kong.listPlugins();
          console.log('Plugins:', JSON.stringify(plugins, null, 2));
          break;
        default:
          console.log('Usage: npm run kong [setup|status|list-services|list-routes|list-plugins]');
          process.exit(1);
      }
      process.exit(0);
    } catch (error) {
      console.error('Kong setup failed:', error);
      process.exit(1);
    }
  })();
}
