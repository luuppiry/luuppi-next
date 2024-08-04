'use client';
import { reservationChargeAll } from '@/actions/reservation-charge-all';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { useState } from 'react';
import QuestionConfirmDialog from '../QuestionConfirmDialog/QuestionConfirmDialog';
import SubmitButton from '../SubmitButton/SubmitButton';
import ErrorDialog from '../Ticket/ErrorDialog';

interface PayButtonProps {
  lang: SupportedLanguage;
  dictionary: Dictionary;
  hasUnansweredQuestions: boolean;
}

export default function PayButton({
  lang,
  dictionary,
  hasUnansweredQuestions,
}: PayButtonProps) {
  const [response, setResponse] = useState<{
    isError: boolean;
    message: string;
  } | null>(null);
  const [questionConfirmation, setQuestionConfirmation] = useState(false);
  const reservationChargeAllAction = reservationChargeAll.bind(null, lang);

  return (
    <>
      <ErrorDialog
        dictionary={dictionary}
        open={!!response}
        response={response}
        onClose={() => setResponse(null)}
      />
      <QuestionConfirmDialog
        dictionary={dictionary}
        open={questionConfirmation}
        onClose={() => setQuestionConfirmation(false)}
      />
      <form
        action={async () => {
          if (hasUnansweredQuestions) {
            setQuestionConfirmation(true);
            return;
          }
          const response = await reservationChargeAllAction();
          setResponse(response);
        }}
        className="mt-4"
      >
        <SubmitButton text={dictionary.pages_events.move_to_checkout} />
      </form>
    </>
  );
}
