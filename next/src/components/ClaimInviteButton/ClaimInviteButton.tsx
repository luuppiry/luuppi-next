'use client';

import { claimInvite } from '@/actions/claim-invite';
import { Dictionary } from '@/models/locale';
import { useState } from 'react';

interface ClaimInviteButtonProps {
  id: string;
  dictionary: Dictionary;
  lang: string;
}

export function ClaimInviteButton({
  id,
  lang,
  dictionary,
}: ClaimInviteButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const handleClaim = claimInvite.bind(null, id, lang);

  return (
    <>
      {error ? (
        <div className="alert alert-error">{error}</div>
      ) : (
        <form
          action={async () => {
            const response = await handleClaim();
            if (response.isError) {
              setError(response.message);
            }
          }}
        >
          <button className="btn btn-primary btn-wide" type="submit">
            {dictionary.pages_invite.accept_invite}
          </button>
        </form>
      )}
    </>
  );
}
