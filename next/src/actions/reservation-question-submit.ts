'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse } from '@/types/types';
import { redirect } from 'next/navigation';

export async function reservationQuestionSubmit(
  reservationId: number,
  lang: SupportedLanguage,
  answers: {
    id: string;
    type: 'select' | 'text' | 'checkbox';
    value: string | boolean;
  }[],
) {
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

  const allowedTextQuestions =
    event.data.attributes.Registration?.QuestionsText?.length ?? 0;
  const allowedSelectQuestions =
    event.data.attributes.Registration?.QuestionsSelect?.length ?? 0;
  const allowedCheckboxQuestions =
    event.data.attributes.Registration?.QuestionsCheckbox?.length ?? 0;

  // Check if the number of answers is correct
  const textQuestions = answers.filter((answer) => answer.type === 'text');
  const selectQuestions = answers.filter((answer) => answer.type === 'select');
  const checkboxQuestions = answers.filter(
    (answer) => answer.type === 'checkbox',
  );

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

  // Check if select questions have valid values
  const allowedSelectAnswers =
    event.data.attributes.Registration?.QuestionsSelect?.map((q) => ({
      en: q.ChoicesEn.split(',').map((c) => c.trim()),
      fi: q.ChoicesFi.split(',').map((c) => c.trim()),
    })) ?? [];

  for (let i = 0; i < allowedSelectAnswers.length; i++) {
    const answer = selectQuestions[i];
    const allowedAnswers = allowedSelectAnswers[i];

    if (lang === 'en') {
      if (!allowedAnswers.en.includes(answer.value as string)) {
        logger.error('Invalid answer:', answer.value);
        return {
          message: dictionary.api.invalid_answer,
          isError: true,
        };
      }
    }

    if (lang === 'fi') {
      if (!allowedAnswers.fi.includes(answer.value as string)) {
        logger.error('Invalid answer:', answer.value);
        return {
          message: dictionary.api.invalid_answer,
          isError: true,
        };
      }
    }
  }

  // Check if checkbox questions have valid values meaning every value is a boolean
  for (let i = 0; i < checkboxQuestions.length; i++) {
    const answer = checkboxQuestions[i];

    if (typeof answer.value !== 'boolean') {
      logger.error('Invalid answer:', answer.value);
      return {
        message: dictionary.api.invalid_answer,
        isError: true,
      };
    }
  }

  // Check if text questions have valid values meaning every value is a string and within the length limits
  for (let i = 0; i < textQuestions.length; i++) {
    const answer = textQuestions[i];
    const question = event.data.attributes.Registration?.QuestionsText?.[i]!;

    if (typeof answer.value !== 'string') {
      logger.error('Invalid answer:', answer.value);
      return {
        message: dictionary.api.invalid_answer,
        isError: true,
      };
    }

    if (
      answer.value.length < question.MinLength ||
      answer.value.length > question.MaxLength
    ) {
      logger.error('Invalid answer:', answer.value);
      return {
        message: dictionary.api.invalid_answer,
        isError: true,
      };
    }
  }

  await prisma.$transaction(async (prisma) => {
    // Delete all previous answers for this registration
    await prisma.answer.deleteMany({
      where: {
        entraUserUuid: session.user?.entraUserUuid!,
        registrationId: reservationId,
      },
    });

    // Insert new answers
    await prisma.answer.createMany({
      data: answers.map((answer) => ({
        answer: answer.value.toString(),
        entraUserUuid: session.user?.entraUserUuid!,
        question: answer.id,
        registrationId: reservationId,
        type:
          answer.type === 'checkbox'
            ? 'CHECKBOX'
            : answer.type === 'select'
              ? 'SELECT'
              : 'TEXT',
      })),
    });
  });

  return redirect(`/${lang}/own-events`);
}