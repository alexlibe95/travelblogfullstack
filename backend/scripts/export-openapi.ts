import { writeFileSync } from 'fs';
import { join } from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

// Create swagger spec without requiring environment variables
// This allows exporting the spec without a full server setup
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Travel Blog API',
      version: '1.0.0',
      description: 'RESTful API for Travel Blog application built with Parse Server',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: process.env.SERVER_URL || 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        sessionToken: {
          type: 'apiKey',
          in: 'header',
          name: 'x-parse-session-token',
          description: 'Session token obtained from login endpoint',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Error message',
                },
                statusCode: {
                  type: 'number',
                  description: 'HTTP status code',
                },
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              example: 'admin',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            sessionToken: {
              type: 'string',
              example: 'r:abc123...',
            },
            user: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: 'user123',
                },
                username: {
                  type: 'string',
                  example: 'admin',
                },
              },
            },
          },
        },
        Island: {
          type: 'object',
          properties: {
            objectId: {
              type: 'string',
              example: 'island123',
            },
            name: {
              type: 'string',
              example: 'Santorini',
            },
            short_description: {
              type: 'string',
              example: 'Beautiful Greek island',
            },
            description: {
              type: 'string',
              example: 'Full description of the island...',
            },
            order: {
              type: 'number',
              example: 1,
            },
            site: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com',
            },
            photo: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/photo.jpg',
            },
            photo_thumb: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/photo_thumb.jpg',
            },
            location: {
              type: 'object',
              properties: {
                latitude: {
                  type: 'number',
                  example: 36.3932,
                },
                longitude: {
                  type: 'number',
                  example: 25.4615,
                },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        IslandListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Island',
              },
            },
          },
        },
        IslandDetailResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              $ref: '#/components/schemas/Island',
            },
          },
        },
        UpdateIslandRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Updated Island Name',
            },
            short_description: {
              type: 'string',
              example: 'Updated short description',
            },
            description: {
              type: 'string',
              example: 'Updated full description',
            },
            order: {
              type: 'number',
              example: 1,
            },
            site: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com',
            },
            location: {
              type: 'object',
              properties: {
                latitude: {
                  type: 'number',
                  example: 36.3932,
                },
                longitude: {
                  type: 'number',
                  example: 25.4615,
                },
              },
            },
          },
        },
        UploadPhotoResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            photoUrl: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/photo.jpg',
            },
          },
        },
        SearchResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            count: {
              type: 'number',
              example: 5,
            },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: 'island123',
                  },
                  name: {
                    type: 'string',
                    example: 'Santorini',
                  },
                },
              },
            },
            message: {
              type: 'string',
              example: 'No islands found',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints',
      },
      {
        name: 'Islands',
        description: 'Island management endpoints',
      },
      {
        name: 'Search',
        description: 'Search functionality',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const outputPath = join(process.cwd(), 'openapi.json');

try {
  const swaggerSpec = swaggerJsdoc(options);
  const spec = swaggerSpec as unknown as Record<string, unknown>;
  writeFileSync(outputPath, JSON.stringify(spec, null, 2), 'utf-8');
  console.log(`✅ OpenAPI spec exported to: ${outputPath}`);
} catch (error) {
  console.error('❌ Failed to export OpenAPI spec:', error);
  process.exit(1);
}
