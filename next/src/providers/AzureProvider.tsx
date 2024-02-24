'use client';
import {
  Configuration,
  EventType,
  PublicClientApplication,
} from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import React, { useMemo } from 'react';

export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_FRONTEND_CLIENT_ID!,
    authority: `https://${process.env.NEXT_PUBLIC_AZURE_TENANT_NAME}.ciamlogin.com/`,
    navigateToLoginRequestUrl: false,
    redirectUri: process.env.NEXT_PUBLIC_BASE_URL,

    // https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/performance.md#bypass-authority-metadata-resolution
    authorityMetadata: process.env.NEXT_PUBLIC_AZURE_AUTHORITY_METADATA,
    skipAuthorityMetadataCache: true,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const AzureProvider = ({ children }: { children: React.ReactNode }) => {
  const msalInstance = useMemo(() => {
    const instance = new PublicClientApplication(msalConfig);

    if (!instance.getActiveAccount() && instance.getAllAccounts().length > 0) {
      instance.setActiveAccount(instance.getAllAccounts()[0]);
    }

    instance.addEventCallback((event) => {
      if (
        (event.eventType === EventType.LOGIN_SUCCESS ||
          event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS ||
          event.eventType === EventType.SSO_SILENT_SUCCESS) &&
        (event.payload as any).account
      ) {
        instance.setActiveAccount((event.payload as any).account);
      }
    });

    return instance;
  }, []);

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};
