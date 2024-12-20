import { logger } from './libs/utils/logger';

export function register() {
  if (process.env.NEXT_RUNTIME === 'node') {
    logger.info('Validating environment variables');

    const envValidation = {
      // Must be a valid URL
      NEXT_PUBLIC_STRAPI_BASE_URL: {
        regex: /^(http|https):\/\/[^ "]+$/,
        message: 'NEXT_PUBLIC_STRAPI_BASE_URL must be a valid URL',
      },
      NEXT_PUBLIC_BASE_URL: {
        regex: /^(http|https):\/\/[^ "]+$/,
        message: 'NEXT_PUBLIC_BASE_URL must be a valid URL',
      },
      TOKEN_VERSION: {
        regex: /^[0-9]+$/,
        message: 'TOKEN_VERSION must be a number',
      },
      NEXT_PUBLIC_NO_ROLE_ID: {
        // Only lowercase chars (with äö), numbers and - allowed
        regex: /^[a-z0-9äö-]+$/,
        message:
          'NEXT_PUBLIC_NO_ROLE_ID must be lowercase characters, numbers and -',
      },
      NEXT_PUBLIC_LUUPPI_MEMBER_ID: {
        // Only lowercase chars (with äö), numbers and - allowed
        regex: /^[a-z0-9äö-]+$/,
        message:
          'NEXT_PUBLIC_LUUPPI_MEMBER_ID must be lowercase characters, numbers and -',
      },
      NEXT_PUBLIC_LUUPPI_HATO_ID: {
        // Only lowercase chars (with äö), numbers and - allowed
        regex: /^[a-z0-9äö-]+$/,
        message:
          'NEXT_PUBLIC_LUUPPI_HATO_ID must be lowercase characters, numbers and -',
      },
      AZURE_TENANT_NAME: {
        // Only alphanumeric characters and -
        regex: /^[a-zA-Z0-9]+$/,
        message: 'AZURE_TENANT_NAME must be alphanumeric characters',
      },
      AZURE_TENANT_ID: {
        // Must be a valid UUID
        regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        message: 'AZURE_TENANT_ID must be a valid UUID',
      },
      AZURE_COMMUNICATION_SERVICE_CONNECTION_STRING: {
        regex: /^endpoint=https:\/\/[^ "]+$/,
        message:
          'AZURE_COMMUNICATION_SERVICE_CONNECTION_STRING must start with endpoint=https://',
      },
      AZURE_COMMUNICATION_SERVICE_SENDER_EMAIL: {
        // Must be a valid email
        regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message:
          'AZURE_COMMUNICATION_SERVICE_SENDER_EMAIL must be a valid email',
      },
      AZURE_P_CLIENT_ID: {
        // Must be a valid UUID
        regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        message: 'AZURE_P_CLIENT_ID must be a valid UUID',
      },
      AZURE_P_CLIENT_SECRET: {
        // Must be a string
        regex: /./,
        message: 'AZURE_P_CLIENT_SECRET must be a string',
      },
      AZURE_S_CLIENT_ID: {
        // Must be a valid UUID
        regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        message: 'AZURE_S_CLIENT_ID must be a valid UUID',
      },
      AZURE_S_CLIENT_SECRET: {
        // Must be a string
        regex: /./,
        message: 'AZURE_S_CLIENT_SECRET must be a string',
      },
      JWT_SECRET: {
        // Must be a string
        regex: /./,
        message: 'JWT_SECRET must be a string',
      },
      AUTH_SECRET: {
        // Must be a string
        regex: /./,
        message: 'AUTH_SECRET must be a string',
      },
      REVALIDATE_AUTH_SECRET: {
        // Must be a string
        regex: /./,
        message: 'REVALIDATE_AUTH_SECRET must be a string',
      },
      SLACK_WEBHOOK_URL: {
        // Starts with https://hooks.slack.com/services/
        regex: /^https:\/\/hooks.slack.com\/services\//,
        message: 'SLACK_WEBHOOK_URL must be a valid URL',
      },
      REDIS_PORT: {
        // Must be a number
        regex: /^[0-9]+$/,
        message: 'REDIS_PORT must be a number',
      },
      TURNSTILE_SECRET: {
        // Must be a string
        regex: /./,
        message: 'TURNSTILE_SECRET must be a string',
      },
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: {
        // Must be a string
        regex: /./,
        message: 'NEXT_PUBLIC_TURNSTILE_SITE_KEY must be a string',
      },
      DATABASE_URL: {
        // Must be a valid URL
        regex: /^postgres:\/\/[^ "]+$/,
        message: 'DATABASE_URL must be a valid URL',
      },
      DATABASE_USERNAME: {
        // Must be a string
        regex: /./,
        message: 'DATABASE_USERNAME must be a string',
      },
      DATABASE_PASSWORD: {
        // Must be a string
        regex: /./,
        message: 'DATABASE_PASSWORD must be a string',
      },
      DATABASE_NAME: {
        // Must be a string
        regex: /./,
        message: 'DATABASE_NAME must be a string',
      },
      VISMAPAY_API_KEY: {
        // Must be a string
        regex: /./,
        message: 'VISMAPAY_API must be a string',
      },
      VISMAPAY_PRIVATE_KEY: {
        // Must be a string
        regex: /./,
        message: 'VISMAPAY_PRIVATE_KEY must be a string',
      },
      STRAPI_API_KEY: {
        // Must be a string
        regex: /./,
        message: 'STRAPI_API must be a string',
      },
    };

    for (const [key, value] of Object.entries(envValidation)) {
      if (!process.env[key]) {
        logger.error(`Environment variable ${key} is missing`);
        throw new Error(`Environment variable ${key} is missing`);
      }

      if (!value.regex.test(process.env[key]!)) {
        logger.error(value.message);
        throw new Error(value.message);
      }
    }

    logger.info('Environment variables are valid');
  }
}
