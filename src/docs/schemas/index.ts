/**
 * @file Swagger Schema Definitions
 */

export const swaggerSchemas = {
  User: {
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        example: '507f1f77bcf86cd799439011'
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'john.doe@example.com'
      },
      name: {
        type: 'string',
        example: 'John Doe'
      },
      avatar: {
        type: 'string',
        example: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
      },
      emailVerified: {
        type: 'boolean',
        example: false
      },
      role: {
        type: 'string',
        enum: ['teacher', 'admin', 'student'],
        example: 'student'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-15T10:30:00.000Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-15T10:30:00.000Z'
      }
    }
  },

  RegisterRequest: {
    type: 'object',
    required: ['email', 'password', 'name', 'department', 'year', 'batch', 'semester'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        example: 'john.doe@example.com'
      },
      password: {
        type: 'string',
        minLength: 6,
        example: 'securePassword123'
      },
      name: {
        type: 'string',
        example: 'John Doe'
      },
      role: {
        type: 'string',
        enum: ['teacher', 'admin', 'student'],
        example: 'student'
      },
      avatar: {
        type: 'string',
        format: 'uri',
        example: 'https://example.com/avatar.jpg'
      },
      department: {
        type: 'string',
        example: 'Computer Science'
      },
      year: {
        type: 'number',
        example: 2023
      },
      batch: {
        type: 'number',
        example: 1
      },
      semester: {
        type: 'number',
        example: 1
      }
    }
  },

  RegisterResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'User registered successfully'
      },
      data: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/User'
          },
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          }
        }
      }
    }
  },

  ErrorResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      message: {
        type: 'string',
        example: 'Error message'
      }
    }
  },

  ValidationErrorResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      message: {
        type: 'string',
        enum: [
          'Email, password, and name are required',
          'Please provide a valid email address',
          'Password must be at least 6 characters long'
        ]
      }
    }
  },

  ConflictErrorResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      message: {
        type: 'string',
        example: 'User with this email already exists'
      }
    }
  },

  ServerErrorResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      message: {
        type: 'string',
        example: 'Internal server error. Please try again later.'
      }
    }
  }
};