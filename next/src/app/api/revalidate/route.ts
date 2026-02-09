import prisma from '@/libs/db/prisma';
import { logger } from '@/libs/utils/logger';
import { revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';

/**
 * Strapi sends webhooks to this endpoint to revalidate
 * pages when content is updated.
 * @param request Request object
 * @returns 200 / 401
 */
export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!auth || auth !== process.env.REVALIDATE_AUTH_SECRET) {
    logger.error('Unauthorized revalidate request');
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const model = body?.model;
  if (model) {
    logger.info(`Revalidating ${model}`);
    revalidateTag(model);

    if (model === 'event') {
      // FIXME: Discard update to a draft, in Strapi 5 all published entries (visible on the website) have publishedAt
      if (!body.entry?.publishedAt) {
        return new Response('OK');
      }

      logger.info(`Revalidating event-${body.entry.id}`);

      if (!body.entry?.id) {
        logger.error(`No entry found for event-${body.entry.id}`);
        return new Response('No entry found', { status: 400 });
      }

      revalidateTag(`event-${body.entry.id}`);

      const {
        NameFi,
        NameEn,
        LocationFi,
        LocationEn,
        StartDate,
        EndDate,
        id,
        documentId,
      } = body.entry;

      await createEvent({
        NameFi,
        NameEn,
        LocationFi,
        LocationEn,
        StartDate,
        EndDate,
        id,
        documentId,
      });
    }

    if (model === 'event-role') {
      if (!body.entry) {
        logger.error('No entry found for event-role');
        return new Response('No entry found', { status: 400 });
      }

      const { RoleId } = body.entry;
      await createRole(RoleId);
    }
  }

  return new Response('OK');
}

function createRole(roleId: string) {
  return prisma.role.upsert({
    where: {
      strapiRoleUuid: roleId,
    },
    create: {
      strapiRoleUuid: roleId,
    },
    update: {
      strapiRoleUuid: roleId,
    },
  });
}

async function createEvent({
  NameFi,
  NameEn,
  LocationFi,
  LocationEn,
  StartDate,
  EndDate,
  id,
  documentId,
}: {
  NameFi: string;
  NameEn: string;
  LocationFi: string;
  LocationEn: string;
  StartDate: string;
  EndDate: string;
  id: number;
  documentId: string;
}) {
  // FIXME: Legacy compabibility layer for Strapi 4 -> 5 migration where IDs may change.
  // `documentId` should be used in the future since it's the stable identifier now.
  const existingEvent = await prisma.event.findFirst({
    where: {
      OR: [
        {
          nameEn: NameEn,
          startDate: StartDate,
          locationFi: LocationFi,
        },
        { eventDocumentId: documentId },
      ],
    },
  });

  if (existingEvent && existingEvent.eventId !== id) {
    // Event exists but with a different strapi ID
    logger.info(
      `Migrating event "${NameEn}" from old Strapi ID ${existingEvent.eventId} to new ID ${id}`,
    );

    return prisma.event.update({
      where: {
        id: existingEvent.id,
      },
      data: {
        eventDocumentId: documentId,
        eventId: id,
        endDate: EndDate,
        locationEn: LocationEn,
        locationFi: LocationFi,
        nameEn: NameEn,
        nameFi: NameFi,
        startDate: StartDate,
      },
    });
  }

  return prisma.event.upsert({
    where: {
      // FIXME: use `eventDocumentId: documentId`
      eventId: id,
    },
    create: {
      eventDocumentId: documentId,
      endDate: EndDate,
      eventId: id,
      locationEn: LocationEn,
      locationFi: LocationFi,
      nameEn: NameEn,
      nameFi: NameFi,
      startDate: StartDate,
    },
    update: {
      eventDocumentId: documentId,
      endDate: EndDate,
      locationEn: LocationEn,
      locationFi: LocationFi,
      nameEn: NameEn,
      nameFi: NameFi,
      startDate: StartDate,
    },
  });
}
