'use client';
import { getDictionary } from '@/dictionaries';
import { getSilentToken, logger, verifyEmail } from '@/libs';
import { InteractionStatus } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { useEffect, useState } from 'react';

interface EmailVerifyProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  token: string;
}

export default function EmailVerify({ dictionary, token }: EmailVerifyProps) {
  const { instance, inProgress } = useMsal();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const activeAccount = instance.getActiveAccount();
        if (inProgress === InteractionStatus.None && activeAccount) {
          const accessToken = await getSilentToken(instance);
          const verifyEmailRes = await verifyEmail(accessToken, token);
          if (verifyEmailRes) {
            //
          } else {
            //
          }
        }
      } catch (error) {
        logger.error('Failed to authenticate', error);
      }
    })();
  }, [instance, inProgress]);
  return (
    <>
      <p>temp</p>
    </>
  );
}
