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

  const url = `/api/events/${registration.eventDocumentId}?populate[Registration][populate][0]=QuestionsText&populate[Registration][populate][1]=QuestionsSelect&populate[Registration][populate][2]=QuestionsCheckbox`;

  const events = await getStrapiData<APIResponse<'api::event.event'>>(
    lang,
    url,
    [`event-${registration.eventDocumentId}`],
    true,
  );

  const event = events?.data;

  if (!event) {
    return {
      message: dictionary.api.invalid_event,
      isError: true,
    };
  }

  // Fallback to the day before the event if the registration does not have an answerableUntil date
  const eventStart = new Date(event.StartDate);

  const allowAnswerChangesUntil = event.Registration?.AllowQuestionEditUntil
    ? new Date(event.Registration?.AllowQuestionEditUntil)
    : eventStart;

  if (allowAnswerChangesUntil < new Date()) {
    return {
      message: dictionary.api.invalid_answer_time,
      isError: true,
    };
  }

  const allowedTextQuestions = event.Registration?.QuestionsText?.length ?? 0;
  const allowedSelectQuestions =
    event.Registration?.QuestionsSelect?.length ?? 0;
  const allowedCheckboxQuestions =
    event.Registration?.QuestionsCheckbox?.length ?? 0;

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
  const allowedSelectChoices =
    event.Registration?.QuestionsSelect?.map((q) => ({
      en: q.ChoicesEn.split(',').map((c) => c.trim()),
      fi: q.ChoicesFi.split(',').map((c) => c.trim()),
    })) ?? [];

  for (let i = 0; i < allowedSelectChoices.length; i++) {
    const answer = selectQuestions[i];
    const allowedAnswers = allowedSelectChoices[i];

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
    const question = event.Registration?.QuestionsText?.[i]!;

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
      data: answers.map((answer) => {
        let selectIndex: number | null = null;
        if (answer.type === 'select') {
          const allowedAnswers = allowedSelectChoices.find((a) =>
            lang === 'en'
              ? a.en.includes(answer.value as string)
              : a.fi.includes(answer.value as string),
          );

          selectIndex = allowedAnswers
            ? lang === 'en'
              ? allowedAnswers.en.indexOf(answer.value as string)
              : allowedAnswers.fi.indexOf(answer.value as string)
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
          entraUserUuid: session.user?.entraUserUuid!,
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
