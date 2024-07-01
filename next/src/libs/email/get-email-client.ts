import { EmailClient } from '@azure/communication-email';

export const emailClient = new EmailClient(
  process.env.AZURE_COMMUNICATION_SERVICE_CONNECTION_STRING!,
);
