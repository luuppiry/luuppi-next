import { SupportedLanguage } from '@/models/locale';
import { APIResponse } from '@/types/types';
import { QuestionType } from '@prisma/client';

export const getQuestion = (
  event: APIResponse<'api::event.event'>['data'] | undefined,
  lang: SupportedLanguage,
  question: string,
  type: QuestionType,
) => {
  const questionIndex = parseInt(question.split('-')[1], 10);

  switch (type) {
    case 'TEXT':
      return lang === 'en'
        ? event?.attributes.Registration?.QuestionsText?.[questionIndex]
            ?.QuestionEn
        : event?.attributes.Registration?.QuestionsText?.[questionIndex]
            ?.QuestionFi;
    case 'SELECT':
      return lang === 'en'
        ? event?.attributes.Registration?.QuestionsSelect?.[questionIndex]
            ?.QuestionEn
        : event?.attributes.Registration?.QuestionsSelect?.[questionIndex]
            ?.QuestionFi;
    case 'CHECKBOX':
      return lang === 'en'
        ? event?.attributes.Registration?.QuestionsCheckbox?.[questionIndex]
            ?.QuestionEn
        : event?.attributes.Registration?.QuestionsCheckbox?.[questionIndex]
            ?.QuestionFi;
    default:
      return '';
  }
};
