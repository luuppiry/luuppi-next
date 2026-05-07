'use client';
import { reservationChargeAll } from '@/actions/reservation-charge-all';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import {
  QuestionContext,
  type QuestionData,
} from '@/providers/QuestionProvider';
import { useContext, useState } from 'react';
import SubmitButton from '../SubmitButton/SubmitButton';
import ErrorDialog from '../Ticket/ErrorDialog';

interface PayButtonProps {
  lang: SupportedLanguage;
  dictionary: Dictionary;
  isFreeTicket?: boolean;
  hasUnansweredQuestions: boolean;
  unansweredQuestionsData: QuestionData[];
}

export default function PayButton({
  lang,
  dictionary,
  hasUnansweredQuestions,
  isFreeTicket,
  unansweredQuestionsData,
}: PayButtonProps) {
  const [response, setResponse] = useState<{
    isError: boolean;
    message: string;
  } | null>(null);
  const reservationChargeAllAction = reservationChargeAll.bind(null, lang);

  const ctx = useContext(QuestionContext);

  const startQuestionFlow = (index = 0) => {
    if (index >= unansweredQuestionsData.length) {
      ctx.setData(null);
      reservationChargeAllAction().then(setResponse);
      return;
    }

    const data = unansweredQuestionsData[index];
    ctx.setData({
      reservationId: data.reservationId,
      questions: data.questions,
      answers: data.answers,
      isPayFlow: true,
      isLastInPayFlow: index === unansweredQuestionsData.length - 1,
      isFreeTicket: isFreeTicket,
      onSuccess: () => startQuestionFlow(index + 1),
    });
  };

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
          if (hasUnansweredQuestions) {
            startQuestionFlow(0);
            return;
          }
          const response = await reservationChargeAllAction();
          setResponse(response);
        }}
        className="mt-4"
      >
        <SubmitButton
          text={
            dictionary.pages_events[
              isFreeTicket ? 'redeem_ticket' : 'move_to_checkout'
            ]
          }
        />
      </form>
    </>
  );
}
