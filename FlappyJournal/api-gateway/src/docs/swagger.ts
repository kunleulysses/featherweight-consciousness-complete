import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { config } from '../config';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Featherweight API Gateway',
      version: '1.0.0',
      description: 'API Gateway for Featherweight Journal microservices',
      contact: {
        name: 'Featherweight Team',
        url: 'https://app.featherweight.world',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}`,
        description: 'Development server',
      },
      {
        url: 'https://api.featherweight.world',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /api/auth/login',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication information is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Unauthorized',
                  },
                  message: {
                    type: 'string',
                    example: 'Invalid or missing Authorization Bearer token',
                  },
                  timestamp: {
                    type: 'string',
                    format: 'date-time',
                  },
                },
              },
            },
          },
        },
        RateLimitError: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Too Many Requests',
                  },
                  message: {
                    type: 'string',
                    example: 'Rate limit exceeded: 100 requests per 5 minutes per IP',
                  },
                  retryAfter: {
                    type: 'number',
                    example: 300,
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Gateway health check',
          description: 'Check if the API Gateway is running and healthy',
          security: [],
          responses: {
            '200': {
              description: 'Gateway is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: {
                        type: 'string',
                        example: 'healthy',
                      },
                      timestamp: {
                        type: 'string',
                        format: 'date-time',
                      },
                      version: {
                        type: 'string',
                        example: '1.0.0',
                      },
                      services: {
                        type: 'object',
                        properties: {
                          auth: { type: 'string' },
                          journal: { type: 'string' },
                          websocket: { type: 'string' },
                          frontend: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/ready': {
        get: {
          tags: ['Health'],
          summary: 'Gateway readiness check',
          description: 'Check if the API Gateway and downstream services are ready',
          security: [],
          responses: {
            '200': {
              description: 'Gateway and services are ready',
            },
            '503': {
              description: 'Gateway or services are not ready',
            },
          },
        },
      },
      '/api/auth/*': {
        all: {
          tags: ['Authentication'],
          summary: 'Authentication service endpoints',
          description: 'Proxied to the Authentication service. Includes login, register, refresh, etc.',
          parameters: [
            {
              name: 'path',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Authentication endpoint path',
            },
          ],
          responses: {
            '200': {
              description: 'Successful response from auth service',
            },
            '401': {
              '$ref': '#/components/responses/UnauthorizedError',
            },
            '429': {
              '$ref': '#/components/responses/RateLimitError',
            },
          },
        },
      },
      '/api/journal/*': {
        all: {
          tags: ['Journal'],
          summary: 'Journal service endpoints',
          description: 'Proxied to the Journal service. Requires authentication.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'path',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Journal endpoint path',
            },
          ],
          responses: {
            '200': {
              description: 'Successful response from journal service',
            },
            '401': {
              '$ref': '#/components/responses/UnauthorizedError',
            },
            '429': {
              '$ref': '#/components/responses/RateLimitError',
            },
          },
        },
      },
      '/ws/chat': {
        get: {
          tags: ['WebSocket'],
          summary: 'Chat WebSocket connection',
          description: 'WebSocket upgrade endpoint for real-time chat. Requires authentication.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'Upgrade',
              in: 'header',
              required: true,
              schema: {
                type: 'string',
                enum: ['websocket'],
              },
            },
            {
              name: 'Connection',
              in: 'header',
              required: true,
              schema: {
                type: 'string',
                enum: ['Upgrade'],
              },
            },
          ],
          responses: {
            '101': {
              description: 'WebSocket connection established',
            },
            '401': {
              '$ref': '#/components/responses/UnauthorizedError',
            },
            '429': {
              '$ref': '#/components/responses/RateLimitError',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Authentication',
        description: 'Authentication service endpoints',
      },
      {
        name: 'Journal',
        description: 'Journal service endpoints',
      },
      {
        name: 'WebSocket',
        description: 'WebSocket connection endpoints',
      },
    ],
  },
  apis: ['./src/index.ts', './src/middleware/*.ts'], // Files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  // Serve swagger UI at /api/docs
  app.use('/api/docs', swaggerUi.serve);
  app.get('/api/docs', swaggerUi.setup(specs, {
    explorer: true,
    customSiteTitle: 'Featherweight API Gateway Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  }));

  // Serve raw OpenAPI spec as JSON
  app.get('/api/docs/openapi.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  // Serve raw OpenAPI spec as YAML
  app.get('/api/docs/openapi.yaml', (req, res) => {
    res.setHeader('Content-Type', 'text/yaml');
    const yaml = require('yamljs');
    res.send(yaml.stringify(specs, 4));
  });
};

export default specs;
