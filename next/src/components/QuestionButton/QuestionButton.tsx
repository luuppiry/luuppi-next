'use client';
import { Dictionary } from '@/models/locale';
import { QuestionContext } from '@/providers/QuestionProvider';
import { $Enums } from '@prisma/client';
import { useContext } from 'react';

interface QuestionButtonProps {
  reservationId: number;
  questions: {
    eventId: number;
    text: {
      id?: number;
      QuestionEn: string;
      QuestionFi: string;
      MaxLength: number;
      MinLength: number;
      Required: boolean;
    }[];
    select: {
      id?: number;
      ChoicesEn: string;
      ChoicesFi: string;
      QuestionEn: string;
      QuestionFi: string;
    }[];
    checkbox: {
      id?: number;
      QuestionFi: string;
      QuestionEn: string;
    }[];
  };
  answers: {
    id: number;
    type: $Enums.QuestionType;
    question: string;
    answer: string;
    entraUserUuid: string;
    registrationId: number;
  }[];
  dictionary: Dictionary;
}

export default function QuestionButton({
  reservationId,
  questions,
  answers,
  dictionary,
}: QuestionButtonProps) {
  const ctx = useContext(QuestionContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    ctx.setData({ reservationId, questions, answers });
  };

  const hasAnswers = answers.some(
    (answer) => answer.registrationId === reservationId,
  );

  return (
    <button
      className="btn btn-primary btn-sm max-md:btn-xs"
      onClick={handleClick}
    >
      {hasAnswers
        ? dictionary.pages_events.edit_additional_info
        : dictionary.pages_events.fill_additional_info}
    </button>
  );
}
