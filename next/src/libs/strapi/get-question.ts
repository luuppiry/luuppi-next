import { APIResponse } from '@/types/types';
import { QuestionType } from '@prisma/client';

export const getQuestion = (
  event: APIResponse<'api::event.event'>['data'] | undefined,
  lang: string,
  question: string,
  type: QuestionType,
) => {
  const questionIndex = parseInt(question.split('-')[1], 10);

  switch (type) {
    case 'TEXT':
      return lang === 'en'
        ? event?.Registration?.QuestionsText?.[questionIndex]?.QuestionEn
        : event?.Registration?.QuestionsText?.[questionIndex]?.QuestionFi;
    case 'SELECT':
      return lang === 'en'
        ? event?.Registration?.QuestionsSelect?.[questionIndex]?.QuestionEn
        : event?.Registration?.QuestionsSelect?.[questionIndex]?.QuestionFi;
    case 'CHECKBOX':
      return lang === 'en'
        ? event?.Registration?.QuestionsCheckbox?.[questionIndex]?.QuestionEn
        : event?.Registration?.QuestionsCheckbox?.[questionIndex]?.QuestionFi;
    default:
      return '';
  }
};
