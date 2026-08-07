import { SupportedLanguage } from '@/models/locale';
import { APIResponse } from '@/types/types';
import { logger } from '@/libs/utils/logger';

export const getSelectChoice = (
  event: APIResponse<'api::event.event'>['data'] | undefined,
  lang: SupportedLanguage,
  question: string,
  answer: string,
) => {
  const questionIndex = parseInt(question.split('-')[1], 10);
  const answerIndex = parseInt(answer, 10);

  if (Number.isNaN(questionIndex) || Number.isNaN(answerIndex)) {
    logger.error('Invalid question/answer index:', question, answer);
    return '';
  }

  const choicesFiArray =
    event?.Registration?.QuestionsSelect?.[questionIndex]?.ChoicesFi.split(
      ',',
    ).map((c) => c.trim()) ?? [];
  const choicesEnArray =
    event?.Registration?.QuestionsSelect?.[questionIndex]?.ChoicesEn.split(
      ',',
    ).map((c) => c.trim()) ?? [];

  const choice =
    lang === 'fi' ? choicesFiArray[answerIndex] : choicesEnArray[answerIndex];

  return choice ?? '';
};
