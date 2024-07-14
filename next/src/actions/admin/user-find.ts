'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import { QuestionType } from '@prisma/client';

export async function userFind(formData: FormData, lang: SupportedLanguage) {
  const dictionary = await getDictionary(lang);

  const session = await auth();
  const user = session?.user;

  if (!user) {
    logger.error('User not found in session');
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  const email = formData.get('email') as string;
  if (!email) {
    logger.error('Email missing in form data');
    return {
      message: dictionary.api.invalid_credentials,
      isError: true,
    };
  }

  const hasHatoRole = await prisma.rolesOnUsers.findFirst({
    where: {
      entraUserUuid: user.entraUserUuid,
      strapiRoleUuid: process.env.NEXT_PUBLIC_LUUPPI_HATO_ID!,
      OR: [
        {
          expiresAt: {
            gte: new Date(),
          },
        },
        {
          expiresAt: null,
        },
      ],
    },
  });

  if (!hasHatoRole) {
    logger.error('User does not have the required role');
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  const localUser = await prisma.user.findFirst({
    where: {
      email: email,
    },
    include: {
      roles: true,
      registrations: {
        where: {
          deletedAt: null,
          OR: [
            {
              paymentCompleted: true,
            },
            {
              reservedUntil: {
                gte: new Date(),
              },
            },
          ],
        },
        include: {
          answers: true,
          payments: true,
        },
      },
    },
  });

  if (!localUser) {
    return {
      isError: true,
      message: dictionary.api.user_not_found,
    };
  }

  // TODO: Far from optimal, but this is still cached most of the time.
  const url =
    '/api/events?pagination[limit]=9999&sort[0]=createdAt:desc&populate=Registration.TicketTypes.Role&populate=Registration.QuestionsText&populate=Registration.QuestionsSelect&populate=Registration.QuestionsCheckbox';
  const strapiEventData = await getStrapiData<
    APIResponseCollection<'api::event.event'>
  >('fi', url, ['events'], true);

  const registrationsFormatted = localUser?.registrations.map(
    (registration) => {
      const event = strapiEventData?.data.find(
        (event) => event.id === registration.eventId,
      );

      const ticketType = event?.attributes.Registration?.TicketTypes.find(
        (ticketType) =>
          ticketType.Role?.data.attributes.RoleId ===
          registration.strapiRoleUuid,
      );

      const findQuestion = (type: QuestionType, question: string) => {
        // Question is type text-index, select-index or checkbox-index so take the index
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
              ? event?.attributes.Registration?.QuestionsCheckbox?.[
                  questionIndex
                ]?.QuestionEn
              : event?.attributes.Registration?.QuestionsCheckbox?.[
                  questionIndex
                ]?.QuestionFi;
          default:
            return '';
        }
      };

      return {
        id: registration.id,
        eventId: registration.eventId,
        eventName:
          lang === 'en' ? event?.attributes.NameEn : event?.attributes.NameFi,
        paymentCompleted: registration.paymentCompleted,
        reservedUntil: registration.reservedUntil,
        ticketType: {
          name: lang === 'en' ? ticketType?.NameEn : ticketType?.NameFi,
          price: ticketType?.Price,
        },
        payments: registration.payments.map((payment) => ({
          status: payment.status,
          orderId: payment.orderId,
        })),
        answers: registration.answers.map((answer) => ({
          question: findQuestion(answer.type, answer.question),
          answer: answer.answer,
        })),
      };
    },
  );

  const foundUserFormatted = {
    entraUserUuid: localUser.entraUserUuid,
    email: localUser.email,
    username: localUser.username,
    major: localUser?.major,
    domicle: localUser?.domicle,
    preferredFullName: localUser?.preferredFullName,
    lastName: localUser?.lastName,
    firstName: localUser?.firstName,
    roles:
      localUser?.roles
        .filter(
          (role) =>
            role.strapiRoleUuid !== process.env.NEXT_PUBLIC_LUUPPI_HATO_ID &&
            role.strapiRoleUuid !== process.env.NEXT_PUBLIC_NO_ROLE_ID,
        )
        .map((role) => ({
          strapiRoleUuid: role.strapiRoleUuid,
          expiresAt: role.expiresAt,
          createdAt: role.createdAt,
        })) ?? [],
    registrations: registrationsFormatted,
  };

  return {
    isError: false,
    message: dictionary.general.success,
    user: foundUserFormatted,
  };
}
