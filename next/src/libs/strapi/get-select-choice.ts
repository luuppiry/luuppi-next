import { SupportedLanguage } from '@/models/locale';
import { APIResponse } from '@/types/types';

export const getSelectChoice = (
  event: APIResponse<'api::event.event'>['data'] | undefined,
  lang: SupportedLanguage,
  question: string,
  answer: string,
) => {
  const questionIndex = parseInt(question.split('-')[1], 10);

  const choicesFiArray =
    event?.Registration?.QuestionsSelect?.[questionIndex]?.ChoicesFi.split(
      ',',
    ) ?? [];
  const choicesEnArray =
    event?.Registration?.QuestionsSelect?.[questionIndex]?.ChoicesEn.split(
      ',',
    ) ?? [];

  return lang === 'fi'
    ? choicesFiArray[parseInt(answer, 10)]
    : choicesEnArray[parseInt(answer, 10)];
};
