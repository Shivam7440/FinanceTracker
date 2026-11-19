import swaggerUi from 'swagger-ui-express';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Aura Finance Tracker REST API',
    version: '1.0.0',
    description: 'Enterprise REST API for Personal Finance & Institutional Cash Flow Tracking with PostgreSQL, Redis Caching, RBAC, and Rate Limiting.',
    contact: {
      name: 'Aura Finance Engineering Team',
      email: 'engineering@aurafinance.io'
    }
  },
  servers: [
    {
      url: 'http://localhost:5001/api',
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide JWT token obtained from /api/auth/login or /api/auth/register'
      }
    },
    schemas: {
      UserSafe: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Alex Rostova' },
          email: { type: 'string', format: 'email', example: 'alex@aurafinance.io' },
          role: { type: 'string', enum: ['admin', 'user', 'read-only'], example: 'user' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Food & Dining' },
          type: { type: 'string', enum: ['income', 'expense', 'both'], example: 'expense' },
          color: { type: 'string', example: '#f97316' },
          icon: { type: 'string', example: 'Utensils' }
        }
      },
      Transaction: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          category_id: { type: 'string', format: 'uuid' },
          category_name: { type: 'string', example: 'Cloud Infrastructure & Tech' },
          type: { type: 'string', enum: ['income', 'expense'], example: 'expense' },
          amount: { type: 'string', example: '384.50' },
          description: { type: 'string', example: 'Amazon Web Services Cluster Compute' },
          transaction_date: { type: 'string', format: 'date', example: '2026-10-15' },
          created_at: { type: 'string', format: 'date-time' }
        }
      },
      PaginatedTransactions: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Transaction' }
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 20 },
              total: { type: 'integer', example: 87 },
              totalPages: { type: 'integer', example: 5 }
            }
          }
        }
      },
      AnalyticsSummary: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          source: { type: 'string', enum: ['cache', 'database'], example: 'cache' },
          ttl: { type: 'integer', example: 900 },
          responseTimeMs: { type: 'number', example: 2.15 },
          data: {
            type: 'object',
            properties: {
              totals: {
                type: 'object',
                properties: {
                  totalIncome: { type: 'string', example: '106200.00' },
                  totalExpenses: { type: 'string', example: '38920.40' },
                  netBalance: { type: 'string', example: '67279.60' },
                  savingsRate: { type: 'number', example: 63.3 },
                  transactionCount: { type: 'integer', example: 87 }
                }
              }
            }
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Descriptive error message' }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        summary: 'System Health & Component Status',
        description: 'Returns operational status of API, PostgreSQL database, and Redis cache.',
        responses: {
          200: { description: 'System healthy' },
          503: { description: 'Service degraded' }
        }
      }
    },
    '/auth/register': {
      post: {
        summary: 'Register new user',
        description: 'Creates a standard user or read-only account. Setting admin role is strictly blocked.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Jane Doe' },
                  email: { type: 'string', example: 'jane@example.com' },
                  password: { type: 'string', example: 'Secret123!' },
                  role: { type: 'string', enum: ['user', 'read-only'], example: 'user' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Account registered' },
          400: { description: 'Validation error' },
          409: { description: 'Email already exists' },
          429: { description: 'Rate limit exceeded (5 requests / 15 min)' }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'User Login & JWT Issue',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'alex@aurafinance.io' },
                  password: { type: 'string', example: 'User@123456' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
          429: { description: 'Rate limit exceeded' }
        }
      }
    },
    '/auth/me': {
      get: {
        summary: 'Current User Profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Profile returned' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/categories': {
      get: {
        summary: 'List Categories',
        description: 'Cached with 1-hour TTL in Redis.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Categories returned' }
        }
      }
    },
    '/transactions': {
      get: {
        summary: 'Query Transactions with Server-side Pagination & Filtering',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['income', 'expense'] } },
          { name: 'categoryId', in: 'query', schema: { type: 'string' } },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['transaction_date', 'amount', 'created_at'] } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } }
        ],
        responses: {
          200: {
            description: 'Paginated transactions list',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedTransactions' } } }
          },
          429: { description: 'Rate limit exceeded (100 req / hour)' }
        }
      },
      post: {
        summary: 'Create Transaction (admin, user)',
        description: 'Prohibited for read-only users. Invalidates Redis analytics cache.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['type', 'amount', 'categoryId'],
                properties: {
                  type: { type: 'string', enum: ['income', 'expense'] },
                  amount: { type: 'number', example: 150.00 },
                  categoryId: { type: 'string', format: 'uuid' },
                  description: { type: 'string', example: 'Team lunch' },
                  transactionDate: { type: 'string', format: 'date', example: '2026-11-20' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Transaction created' },
          403: { description: 'Forbidden (read-only accounts)' }
        }
      }
    },
    '/transactions/{id}': {
      get: {
        summary: 'Get Transaction by ID (ownership checked)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Transaction details' },
          404: { description: 'Not found or forbidden' }
        }
      },
      put: {
        summary: 'Update Transaction (admin, user; ownership checked)',
        description: 'Prohibited for read-only users. Invalidates Redis analytics cache.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Transaction updated' },
          403: { description: 'Forbidden' },
          404: { description: 'Not found' }
        }
      },
      delete: {
        summary: 'Delete Transaction (admin, user; ownership checked)',
        description: 'Prohibited for read-only users. Invalidates Redis analytics cache.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Transaction deleted' },
          403: { description: 'Forbidden' }
        }
      }
    },
    '/analytics/summary': {
      get: {
        summary: 'Financial Period Summary & KPIs',
        description: 'Cached with 15-minute TTL in Redis.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Summary returned' },
          429: { description: 'Rate limit exceeded (50 req / hour)' }
        }
      }
    },
    '/analytics/trends': {
      get: {
        summary: 'Monthly Income vs Expense Historical Trends',
        description: 'Cached with 15-minute TTL in Redis.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Trends returned' }
        }
      }
    },
    '/analytics/categories': {
      get: {
        summary: 'Category-wise Expense Distribution',
        description: 'Cached with 15-minute TTL in Redis.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Distribution returned' }
        }
      }
    },
    '/analytics/benchmark': {
      get: {
        summary: 'Redis Performance Benchmark Test',
        description: 'Measures uncached database latency vs warm Redis cache hit latency.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Benchmark results' }
        }
      }
    },
    '/users': {
      get: {
        summary: 'Admin: List Users and Financial Stats',
        description: 'Accessible strictly by admin role.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User list returned' },
          403: { description: 'Forbidden (non-admins)' }
        }
      }
    }
  }
};

export function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Aura Finance API Documentation'
  }));
}
