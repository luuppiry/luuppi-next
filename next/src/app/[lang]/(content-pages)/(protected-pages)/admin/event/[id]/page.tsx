import { auth } from '@/auth';
import AdminEventRegistrationsList from '@/components/AdminEventRegistrationsList/AdminEventRegistrationsList';
import PickupScanner from '@/components/PickupScanner/PickupScanner';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse } from '@/types/types';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PiArrowLeft } from 'react-icons/pi';

interface AdminEventDetailProps {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}

export default async function AdminEventDetail(props: AdminEventDetailProps) {
  const params = await props.params;
  const session = await auth();
  const dictionary = await getDictionary(params.lang);

  const user = session?.user;

  if (!user?.entraUserUuid || !user?.isLuuppiHato) {
    logger.error('User not found in session or does not have required role');
    redirect(`/${params.lang}`);
  }

  const hasHatoRole = await prisma.rolesOnUsers.findFirst({
    where: {
      entraUserUuid: user.entraUserUuid,
      strapiRoleUuid: process.env.NEXT_PUBLIC_LUUPPI_HATO_ID,
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
    logger.error(`User ${user.entraUserUuid} had expired hato role`);
    redirect('/api/auth/force-signout');
  }

  const eventId = parseInt(params.id);
  if (isNaN(eventId)) {
    redirect(`/${params.lang}/admin?mode=event`);
  }

  const event = await prisma.event.findUnique({
    where: {
      eventId: eventId,
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
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!event) {
    redirect(`/${params.lang}/admin?mode=event`);
  }

  // Fetch Strapi event data to get RequiresPickup field
  const strapiEvent = await getStrapiData<APIResponse<'api::event.event'>>(
    params.lang,
    `/api/events/${eventId}?populate=Registration`,
    [`event-${eventId}`],
    true,
  );

  const requiresPickup = strapiEvent?.data?.attributes?.Registration?.RequiresPickup ?? false;
  const eventName = params.lang === 'fi' ? event.nameFi : event.nameEn;

  return (
    <div className="relative">
      <div className="mb-6 flex items-center justify-between">
        <Link
          className="btn btn-ghost gap-2"
          href={`/${params.lang}/admin?mode=event`}
        >
          <PiArrowLeft size={20} />
          {dictionary.general.back}
        </Link>
        {requiresPickup && (
          <PickupScanner
            dictionary={dictionary}
            eventId={event.eventId}
            lang={params.lang}
          />
        )}
      </div>
      <h1 className="mb-8">{eventName}</h1>
      <AdminEventRegistrationsList
        dictionary={dictionary}
        eventId={event.eventId}
        lang={params.lang}
        requiresPickup={requiresPickup}
      />
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}

export async function generateMetadata(
  props: AdminEventDetailProps,
): Promise<Metadata> {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);
  return {
    title: `${dictionary.pages_admin.event_management} - ${dictionary.navigation.admin}`,
  };
}
