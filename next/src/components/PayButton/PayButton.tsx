'use client';
import { reservationChargeAll } from '@/actions/reservation-charge-all';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { useState } from 'react';
import SubmitButton from '../SubmitButton/SubmitButton';
import ErrorDialog from '../Ticket/ErrorDialog';

interface PayButtonProps {
  lang: SupportedLanguage;
  dictionary: Dictionary;
}

export default function PayButton({ lang, dictionary }: PayButtonProps) {
  const [response, setResponse] = useState<{
    isError: boolean;
    message: string;
  } | null>(null);
  const reservationChargeAllAction = reservationChargeAll.bind(null, lang);

  return (
    <>
      <ErrorDialog
        dictionary={dictionary}
        open={!!response}
        response={response}
        onClose={() => setResponse(null)}
      />
      <form
        action={async () => {
          const response = await reservationChargeAllAction();
          setResponse(response);
        }}
        className="mt-4"
      >
        <SubmitButton
          className="max-md:btn-xs"
          text={dictionary.pages_events.pay_all}
        />
      </form>
    </>
  );
}
