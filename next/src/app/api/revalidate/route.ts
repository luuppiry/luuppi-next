import prisma from '@/libs/db/prisma';
import { logger } from '@/libs/utils/logger';
import { revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';

/**
 * Strapi sends webhooks to this endpoint to revalidate
 * pages when content is updated.
 * @param request Request object
 * @returns 200 / 400 / 401 / 422
 */
export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!auth || auth !== process.env.REVALIDATE_AUTH_SECRET) {
    logger.error('Unauthorized revalidate request');
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const model = body?.model;

  if (body.event !== 'entry.publish' && body.model === 'event') {
    return new Response('Not revalidating a draft event', {
      status: 422,
    });
  }

  if (model) {
    logger.info(`Revalidating ${model}`);
    revalidateTag(model, 'max');

    if (model === 'event') {
      logger.info(`Revalidating event-${body.entry.documentId}`);

      if (!body.entry?.documentId) {
        logger.error(`No entry found for event-${body.entry.documentId}`);
        return new Response('No entry found', { status: 400 });
      }

      revalidateTag(`event-${body.entry.documentId}`, 'max');
      revalidateTag(`event-${body.entry.Slug}`, 'max');

      const {
        NameFi,
        NameEn,
        LocationFi,
        LocationEn,
        StartDate,
        EndDate,
        documentId,
      } = body.entry;

      await createEvent({
        NameFi,
        NameEn,
        LocationFi,
        LocationEn,
        StartDate,
        EndDate,
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
  documentId,
}: {
  NameFi: string;
  NameEn: string;
  LocationFi: string;
  LocationEn: string;
  StartDate: string;
  EndDate: string;
  documentId: string;
}) {
  return prisma.event.upsert({
    where: {
      eventDocumentId: documentId,
    },
    create: {
      eventDocumentId: documentId,
      endDate: EndDate,
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
