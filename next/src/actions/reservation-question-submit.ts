'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { logger } from '@/libs/utils/logger';
import { Dictionary } from '@/models/locale';
import { APIResponse } from '@/types/types';
import { redirect } from 'next/navigation';

type Answer = {
  id: string;
  type: 'select' | 'text' | 'checkbox';
  value: string | boolean;
};

type QuestionSubmitResult = {
  message: string;
  isError: boolean;
};

export async function reservationQuestionSubmit(
  reservationId: number,
  lang: string,
  answers: Answer[],
): Promise<QuestionSubmitResult | never> {
  const dictionary = await getDictionary(lang);

  const session = await auth();
  if (!session?.user) {
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  const registration = await prisma.eventRegistration.findUnique({
    where: {
      id: reservationId,
      entraUserUuid: session.user.entraUserUuid,
    },
  });

  if (!registration) {
    return {
      message: dictionary.api.invalid_registration,
      isError: true,
    };
  }

  const url = `/api/events/${registration.eventId}?populate=Registration.QuestionsText&populate=Registration.QuestionsSelect&populate=Registration.QuestionsCheckbox`;

  const event = await getStrapiData<APIResponse<'api::event.event'>>(
    lang,
    url,
    [`event-${registration.eventId}`],
    true,
  );

  if (!event) {
    return {
      message: dictionary.api.invalid_event,
      isError: true,
    };
  }

  const eventStart = new Date(event.data.StartDate);
  const allowAnswerChangesUntil = event.data.Registration
    ?.AllowQuestionEditUntil
    ? new Date(event.data.Registration.AllowQuestionEditUntil)
    : eventStart;

  if (allowAnswerChangesUntil < new Date()) {
    return {
      message: dictionary.api.invalid_answer_time,
      isError: true,
    };
  }

  const allowedTextQuestions =
    event.data.Registration?.QuestionsText?.length ?? 0;
  const allowedSelectQuestions =
    event.data.Registration?.QuestionsSelect?.length ?? 0;
  const allowedCheckboxQuestions =
    event.data.Registration?.QuestionsCheckbox?.length ?? 0;

  const { textQuestions, selectQuestions, checkboxQuestions } =
    categorizeAnswers(answers);

  if (
    textQuestions.length !== allowedTextQuestions ||
    selectQuestions.length !== allowedSelectQuestions ||
    checkboxQuestions.length !== allowedCheckboxQuestions
  ) {
    return {
      message: dictionary.api.invalid_answer_count,
      isError: true,
    };
  }

  const allowedSelectChoices = parseSelectQuestionChoices(
    event.data.Registration?.QuestionsSelect ?? undefined,
  );

  const selectValidationError = validateSelectAnswers(
    selectQuestions,
    allowedSelectChoices,
    lang,
    dictionary,
  );
  if (selectValidationError) {
    return selectValidationError;
  }

  const checkboxValidationError = validateCheckboxAnswers(
    checkboxQuestions,
    dictionary,
  );
  if (checkboxValidationError) {
    return checkboxValidationError;
  }

  const textValidationError = validateTextAnswers(
    textQuestions,
    event.data.Registration?.QuestionsText ?? undefined,
    dictionary,
  );
  if (textValidationError) {
    return textValidationError;
  }

  await prisma.$transaction(async (prisma) => {
    await prisma.answer.deleteMany({
      where: {
        entraUserUuid: session.user!.entraUserUuid,
        registrationId: reservationId,
      },
    });

    // Insert new answers
    await prisma.answer.createMany({
      data: answers.map((answer) => {
        let selectIndex: number | null = null;
        if (answer.type === 'select') {
          const allowedAnswers = allowedSelectChoices.find((a) =>
            lang === 'en'
              ? a.en?.includes(answer.value as string)
              : a.fi?.includes(answer.value as string),
          );

          selectIndex = allowedAnswers
            ? lang === 'en'
              ? (allowedAnswers.en?.indexOf(answer.value as string) ?? null)
              : (allowedAnswers.fi?.indexOf(answer.value as string) ?? null)
            : null;
        }

        if (selectIndex === null && answer.type === 'select') {
          logger.error('Invalid answer:', answer.value);
          throw new Error(dictionary.api.invalid_answer);
        }

        return {
          answer:
            answer.type === 'select'
              ? selectIndex!.toString()
              : answer.value.toString(),
          entraUserUuid: session.user!.entraUserUuid,
          question: answer.id,
          registrationId: reservationId,
          type:
            answer.type === 'checkbox'
              ? 'CHECKBOX'
              : answer.type === 'select'
                ? 'SELECT'
                : 'TEXT',
        };
      }),
    });
  });

  redirect(`/${lang}/own-events`);
}

function categorizeAnswers(answers: Answer[]) {
  return {
    textQuestions: answers.filter((answer) => answer.type === 'text'),
    selectQuestions: answers.filter((answer) => answer.type === 'select'),
    checkboxQuestions: answers.filter((answer) => answer.type === 'checkbox'),
  };
}

function parseSelectQuestionChoices(
  questionsSelect:
    | Array<{
        ChoicesEn?: string | null;
        ChoicesFi?: string | null;
      }>
    | undefined,
) {
  return (
    questionsSelect?.map((q) => ({
      en: q.ChoicesEn?.split(',').map((c: string) => c.trim()),
      fi: q.ChoicesFi?.split(',').map((c: string) => c.trim()),
    })) ?? []
  );
}

function validateSelectAnswers(
  selectQuestions: Answer[],
  allowedSelectChoices: Array<{ en?: string[]; fi?: string[] }>,
  lang: string,
  dictionary: Dictionary,
): QuestionSubmitResult | null {
  for (let i = 0; i < allowedSelectChoices.length; i++) {
    const answer = selectQuestions[i];
    const allowedAnswers = allowedSelectChoices[i];

    const choices = lang === 'en' ? allowedAnswers.en : allowedAnswers.fi;
    if (!choices?.includes(answer.value as string)) {
      logger.error('Invalid answer:', answer.value);
      return {
        message: dictionary.api.invalid_answer,
        isError: true,
      };
    }
  }
  return null;
}

function validateCheckboxAnswers(
  checkboxQuestions: Answer[],
  dictionary: Dictionary,
): QuestionSubmitResult | null {
  for (const answer of checkboxQuestions) {
    if (typeof answer.value !== 'boolean') {
      logger.error('Invalid answer:', answer.value);
      return {
        message: dictionary.api.invalid_answer,
        isError: true,
      };
    }
  }
  return null;
}

function validateTextAnswers(
  textQuestions: Answer[],
  questionsText:
    | Array<{
        MinLength?: number | null;
        MaxLength?: number | null;
      }>
    | undefined,
  dictionary: Dictionary,
): QuestionSubmitResult | null {
  for (let i = 0; i < textQuestions.length; i++) {
    const answer = textQuestions[i];
    const question = questionsText?.[i];

    if (!question || typeof answer.value !== 'string') {
      logger.error('Invalid answer:', answer.value);
      return {
        message: dictionary.api.invalid_answer,
        isError: true,
      };
    }

    const valueLength = (answer.value as string).length;
    if (
      (question.MinLength && valueLength < question.MinLength) ||
      (question.MaxLength && valueLength > question.MaxLength)
    ) {
      logger.error('Invalid answer:', answer.value);
      return {
        message: dictionary.api.invalid_answer,
        isError: true,
      };
    }
  }
  return null;
}
