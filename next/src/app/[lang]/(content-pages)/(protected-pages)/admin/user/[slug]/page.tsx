import { auth } from '@/auth';
import AdminEventsTable from '@/components/AdminEventManagement/AdminEventsTable/AdminEventsTable';
import AdminRoleEditor from '@/components/AdminUserManagement/AdminRoleEditor/AdminRoleEditor';
import AdminUserGeneral from '@/components/AdminUserManagement/AdminUserGeneral/AdminUserGeneral';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { getQuestion } from '@/libs/strapi/get-question';
import { getSelectChoice } from '@/libs/strapi/get-select-choice';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { APIResponseCollection } from '@/types/types';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export interface UserWithRegistrations {
  entraUserUuid: string;
  email: string | null;
  username: string | null;
  major: string;
  domicle: string | null;
  preferredFullName: string | null;
  lastName: string | null;
  firstName: string | null;
  roles: {
    strapiRoleUuid: string;
    expiresAt: Date | null;
    createdAt: Date;
  }[];
  registrations: {
    id: number;
    eventId: number;
    eventName: string | undefined;
    paymentCompleted: boolean;
    reservedUntil: Date | null;
    ticketType: {
      name: string | undefined;
      price: number | undefined;
    };
    payments: {
      status: string;
      orderId: string;
    }[];
    answers: {
      question: string | undefined;
      answer: string | undefined;
    }[];
  }[];
}

export default async function Page(props: {
  params: Promise<{ slug: string; lang: SupportedLanguage }>;
}) {
  const params = await props.params;

  const { slug, lang } = params;

  const session = await auth();
  const dictionary = await getDictionary(lang);

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

  const user = await prisma.user.findFirst({
    where: { entraUserUuid: slug },
    include: {
      roles: true,
      registrations: {
        where: {
          deletedAt: null,
          OR: [
            { paymentCompleted: true },
            { reservedUntil: { gte: new Date() } },
          ],
        },
        include: {
          answers: true,
          payments: true,
        },
      },
    },
  });

  if (!user) {
    redirect(`/${lang}/admin?mode=user`);
  }

  const url =
    '/api/events?pagination[limit]=9999&sort[0]=createdAt:desc&populate=Registration.TicketTypes.Role&populate=Registration.QuestionsText&populate=Registration.QuestionsSelect&populate=Registration.QuestionsCheckbox';
  const strapiEventData = await getStrapiData<
    APIResponseCollection<'api::event.event'>
  >('fi', url, ['events'], true);

  if (!strapiEventData) {
    redirect(`/${lang}/admin?mode=user`);
  }

  const registrationsFormatted = user.registrations.map((registration) => {
    const event = strapiEventData.data.find(
      (event) => event.id === registration.eventId,
    );

    const ticketType = event?.Registration?.TicketTypes.find(
      (ticketType) => ticketType.Role?.RoleId === registration.strapiRoleUuid,
    );

    return {
      id: registration.id,
      eventId: registration.eventId,
      eventName: lang === 'en' ? event?.NameEn : event?.NameFi,
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
        question: getQuestion(event, lang, answer.question, answer.type),
        answer:
          answer.type === 'SELECT'
            ? getSelectChoice(event, lang, answer.question, answer.answer)
            : answer.answer,
      })),
    };
  });

  const SUPER_ADMINS = process.env.XXX_SUPER_ADMIN_XXX!.split(',');

  const formattedUser: UserWithRegistrations = {
    entraUserUuid: user.entraUserUuid,
    email: user.email,
    username: user.username,
    major: user.major,
    domicle: user.domicle,
    preferredFullName: user.preferredFullName,
    lastName: user.lastName,
    firstName: user.firstName,
    roles: user.roles
      .filter(
        (role) =>
          SUPER_ADMINS.includes(session.user!.entraUserUuid) ||
          (role.strapiRoleUuid !== process.env.NEXT_PUBLIC_LUUPPI_HATO_ID &&
            role.strapiRoleUuid !== process.env.NEXT_PUBLIC_NO_ROLE_ID),
      )
      .map((role) => ({
        strapiRoleUuid: role.strapiRoleUuid,
        expiresAt: role.expiresAt,
        createdAt: role.createdAt,
      })),
    registrations: registrationsFormatted,
  };

  const availableRoles = await prisma.role.findMany({
    select: {
      strapiRoleUuid: true,
    },
  });

  const availableRolesFiltered = availableRoles
    .filter(
      (role) =>
        SUPER_ADMINS.includes(session.user?.entraUserUuid ?? '') ||
        (role.strapiRoleUuid !== process.env.NEXT_PUBLIC_LUUPPI_HATO_ID &&
          role.strapiRoleUuid !== process.env.NEXT_PUBLIC_NO_ROLE_ID),
    )
    .map((role) => role.strapiRoleUuid);

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-6">
        <h2 className="line-clamp-1 break-all text-xl font-semibold">
          {user.email}
        </h2>
        <Link
          className="btn btn-ghost btn-sm"
          href={`/${lang}/admin?mode=user`}
        >
          {dictionary.general.close}
        </Link>
      </div>
      <AdminUserGeneral
        dictionary={dictionary}
        lang={lang}
        user={formattedUser}
      />
      <AdminRoleEditor
        availableRoles={availableRolesFiltered}
        dictionary={dictionary}
        lang={lang}
        user={formattedUser}
      />
      <AdminEventsTable dictionary={dictionary} user={formattedUser} />
    </>
  );
}
