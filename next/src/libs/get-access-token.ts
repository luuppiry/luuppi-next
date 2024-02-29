import { ConfidentialClientApplication } from '@azure/msal-node';
import 'server-only';

const msalConfig = {
  auth: {
    clientId: process.env.AZURE_S_CLIENT_ID!,
    authority: `https://${process.env.AZURE_TENANT_NAME}.ciamlogin.com/`,
    clientSecret: process.env.AZURE_S_CLIENT_SECRET!,
  },
};

/**
 * Get access token with high privilege. This is used on server side to
 * access Microsoft Graph API.
 * @returns Access token or null if failed to get it.
 */
export const getAccessToken = async (): Promise<string | null> => {
  const cca = new ConfidentialClientApplication(msalConfig);

  const tokenRes = await cca.acquireTokenByClientCredential({
    scopes: ['https://graph.microsoft.com/.default'],
  });

  return tokenRes?.accessToken ?? null;
};
