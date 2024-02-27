import { ConfidentialClientApplication } from '@azure/msal-node';

const msalConfig = {
  auth: {
    clientId: process.env.AZURE_S_CLIENT_ID!,
    authority: `https://${process.env.AZURE_TENANT_NAME}.ciamlogin.com/`,
    clientSecret: process.env.AZURE_S_CLIENT_SECRET!,
  },
};

/**
 * Get access token
 * @returns Access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  const cca = new ConfidentialClientApplication(msalConfig);

  const tokenRes = await cca.acquireTokenByClientCredential({
    scopes: ['https://graph.microsoft.com/.default'],
  });

  return tokenRes?.accessToken ?? null;
};
