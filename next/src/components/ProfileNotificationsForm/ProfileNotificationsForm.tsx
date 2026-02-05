'use client';
import { subscribe, unsubscribe } from '@/actions/email-lists';
import { Dictionary } from '@/models/locale';
import { useState } from 'react';
import FormCheckbox from '../FormCheckbox/FormCheckbox';

interface ProfileNotificationsFormProps {
  dictionary: Dictionary;
  subscribed: boolean;
}

export default function ProfileNotificationsForm({
  dictionary,
  subscribed,
}: ProfileNotificationsFormProps) {
  const [isSubscribed, setIsSubscribed] = useState(subscribed);
  const [message, setMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async (unchecked: boolean) => {
    setIsPending(true);
    setMessage(null);

    const result = unchecked
      ? await subscribe(dictionary)
      : await unsubscribe(dictionary);

    if ('isError' in result && result.isError) {
      setMessage({ text: result.message, isError: true });

      // Revert on error
      setIsSubscribed(!unchecked);
    } else {
      setMessage({ text: result.message, isError: false });
      setIsSubscribed(unchecked);
    }

    setIsPending(false);
  };

  return (
    <form className="card card-body">
      <h2 className="mb-4 text-lg font-semibold">
        {dictionary.pages_profile.email_subscription}
      </h2>
      <FormCheckbox
        checked={isSubscribed}
        disabled={isPending}
        id="loop"
        title={dictionary.mail_list.loop}
        onChange={(e) => handleToggle(e.target.checked)}
      />
      {message && (
        <div
          className={`mt-4 rounded-lg p-3 text-sm ${
            message.isError
              ? 'bg-error/10 text-error'
              : 'bg-success/10 text-success'
          }`}
        >
          {message.text}
        </div>
      )}
    </form>
  );
}
