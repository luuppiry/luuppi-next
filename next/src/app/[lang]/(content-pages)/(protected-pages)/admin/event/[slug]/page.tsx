/* eslint-disable arrow-body-style */
import { ExposeData } from '@/app/[lang]/(content-pages)/(protected-pages)/admin/event/[slug]/client';
import { auth } from '@/auth';
import prisma from '@/libs/db/prisma';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse } from '@/types/types';
import { redirect } from 'next/navigation';

export default async function Page(props: {
  params: Promise<{ slug: string; lang: SupportedLanguage }>;
}) {
  const params = await props.params;

  const { slug: eventId, lang } = params;

  const session = await auth();

  if (!session?.user?.isLuuppiHato || !session?.user?.entraUserUuid) {
    redirect(`/${lang}`);
  }

  const hasHatoRole = await prisma.rolesOnUsers.findFirst({
    where: {
      entraUserUuid: session.user.entraUserUuid,
      strapiRoleUuid: process.env.NEXT_PUBLIC_LUUPPI_HATO_ID!,
      OR: [{ expiresAt: { gte: new Date() } }, { expiresAt: null }],
    },
  });

  if (!hasHatoRole) {
    redirect('/api/auth/force-signout');
  }

  const url = `/api/events/${eventId}?populate=Registration.TicketTypes.Role&populate=Registration.QuestionsText&populate=Registration.QuestionsSelect&populate=Registration.QuestionsCheckbox`;
  const strapiEventData = await getStrapiData<APIResponse<'api::event.event'>>(
    'fi',
    url,
    [`event-${eventId}`],
    true,
  );
  const strapiAttributes = strapiEventData?.data.attributes;

  const eventData = await prisma.event.findFirstOrThrow({
    where: {
      eventId: Number.parseInt(eventId, 10),
    },
    include: {
      registrations: {
        where: {
          deletedAt: null,
          paymentCompleted: true,
        },
        include: {
          user: true,
          answers: true,
        },
      },
    },
  });

  const getSoldCount = (strapiRoleUuid: string) => {
    return eventData?.registrations?.reduce(
      (acc, curr) => (curr.strapiRoleUuid === strapiRoleUuid ? ++acc : acc),
      0,
    );
  };

  const getFullName = (
    user: (typeof eventData)['registrations'][number]['user'],
  ) => {
    const { preferredFullName, firstName, lastName, email } = user;

    if (!preferredFullName && !firstName && !lastName) {
      return email;
    }

    if (preferredFullName) {
      const parts = preferredFullName.split(' ');

      if (parts.length !== 1) {
        return `${parts[0]} ${parts.at(-1)}`;
      }
    }

    const parts = [];
    if (firstName) {
      parts.push(firstName.split(' ')[0]);
    }
    if (lastName) {
      parts.push(lastName);
    }

    return parts.length > 0 ? parts.join(' ') : email;
  };

  if (!strapiAttributes) {
    return 'vituiks män';
  }

  const questions = [
    ...strapiAttributes.Registration.QuestionsText,
    ...strapiAttributes.Registration.QuestionsSelect,
  ];

  return (
    <>
      <ExposeData data={strapiAttributes} />

      <h1>{strapiAttributes.NameFi}</h1>

      <div className="mt-5 flex w-full flex-col gap-20">
        {strapiAttributes.Registration.TicketTypes.map((ticket) => (
          <div
            key={ticket.id}
            className="card card-compact w-full scroll-mt-40 items-start overflow-hidden shadow dark:card-bordered dark:shadow-none"
            id={ticket.id}
          >
            <div className="card-body max-w-full">
              <strong className="card-title items-start">
                <span className="text-xl">{ticket.NameFi}</span>
              </strong>

              <span className="badge badge-primary">
                {ticket.Role.data.attributes.RoleId}
              </span>

              <div className="overflow-x-auto">
                <table className="table w-fit">
                  <thead>
                    <tr>
                      <th>Total</th>
                      <th>Sold</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{ticket.TicketsTotal} </td>
                      <td>
                        {getSoldCount(ticket.Role.data.attributes.RoleId)}
                      </td>
                      <td>{ticket.Price}€</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="overflow-x-auto">
                <table className="table table-zebra w-full dark:table-zebra-zebra">
                  <thead>
                    <tr>
                      <th>Name</th>
                      {strapiAttributes.Registration.QuestionsText?.map((q) => (
                        <th key={q.id}>
                          {q[lang === 'en' ? 'QuestionEn' : 'QuestionFi']}
                        </th>
                      ))}
                      {strapiAttributes.Registration.QuestionsSelect?.map(
                        (q) => (
                          <th key={q.id}>
                            {q[lang === 'en' ? 'QuestionEn' : 'QuestionFi']}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {eventData?.registrations
                      .sort(
                        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
                      )
                      .map(({ user, strapiRoleUuid, answers }) => {
                        const roleId = ticket.Role.data.attributes.RoleId;
                        if (strapiRoleUuid !== roleId) {
                          return null;
                        }

                        return (
                          <tr key={user.id}>
                            <td>{getFullName(user)}</td>
                            {answers?.map((answer, i) => (
                              <td
                                key={answer.id}
                                className="max-w-xs text-pretty"
                              >
                                {answer.type === 'SELECT'
                                  ? questions[i][
                                      lang === 'en' ? 'ChoicesEn' : 'ChoicesFi'
                                    ]?.split(',')[answer.answer]
                                  : answer.answer}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
