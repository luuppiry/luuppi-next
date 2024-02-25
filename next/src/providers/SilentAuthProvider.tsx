'use client';
import { InteractionStatus } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { useEffect } from 'react';

export const SilentAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { instance, inProgress } = useMsal();

  useEffect(() => {
    const handleSilentAuth = async () => {
      if (inProgress === InteractionStatus.Startup) {
        return;
      }
      if (inProgress === InteractionStatus.None) {
        if (!instance.getActiveAccount()) {
          await instance.ssoSilent({
            scopes: [],
          });
        }
      }
    };
    handleSilentAuth();
  }, [instance, inProgress]);

  return <>{children}</>;
};
