import prisma from '@/libs/db/prisma';
import { logger } from '@/libs/utils/logger';
import { generatePickupCode } from '@/libs/utils/pickup-code';
import { revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';

const log = logger.child('api:revalidate');

/**
 * Strapi sends webhooks to this endpoint to revalidate
 * pages when content is updated.
 * @param request Request object
 * @returns 200 / 400 / 401 / 422
 */
export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!auth || auth !== process.env.REVALIDATE_AUTH_SECRET) {
    log.error('Unauthorized revalidate request');
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const model: string | undefined = body?.model;
  const documentId: string | undefined = body?.entry?.documentId;

  if (!model) return new Response('OK');

  if (model === 'event' && !documentId) {
    log.error('No documentId in event webhook payload');
    return new Response('No entry found', { status: 400 });
  }

  log.info(`Revalidating ${model}${documentId ? `:${documentId}` : ''}`);
  revalidateStrapiEntry(model, documentId);

  if (model === 'event') {
    // Only sync the DB on publish; drafts and other events skip it
    if (body.event !== 'entry.publish') {
      return new Response('Revalidated, not syncing non-publish event', {
        status: 200,
      });
    }

    const {
      NameFi,
      NameEn,
      LocationFi,
      LocationEn,
      StartDate,
      EndDate,
      Registration,
    } = body.entry;

    await createEvent({
      NameFi,
      NameEn,
      LocationFi,
      LocationEn,
      StartDate,
      EndDate,
      documentId: documentId!,
    });

    if (Registration?.RequiresPickup === true) {
      await backfillPickupCodes(documentId!);
    }
  }

  if (model === 'event-role') {
    if (!body.entry) {
      log.error('No entry found for event-role');
      return new Response('No entry found', { status: 400 });
    }
    await createRole(body.entry.RoleId);
  }

  return new Response('OK');
}

function revalidateStrapiEntry(model: string, documentId?: string) {
  revalidateTag(model, 'max'); // lists + cached "not found" results
  if (documentId) {
    revalidateTag(`${model}:${documentId}`, 'max'); // single-entry lookups
  }
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

async function backfillPickupCodes(eventDocumentId: string) {
  const MAX_ATTEMPTS = 1000;

  const registrationsWithoutCode = await prisma.eventRegistration
    .findMany({
      where: {
        eventDocumentId,
        pickupCode: null,
      },
      select: { id: true },
    })
    .catch(() => []);

  if (registrationsWithoutCode.length === 0) return;

  log.info(
    `Backfilling ${registrationsWithoutCode.length} pickup codes for event-${eventDocumentId}`,
  );

  for (const reg of registrationsWithoutCode) {
    let success = false;
    let attempts = 0;

    while (!success && attempts < MAX_ATTEMPTS) {
      try {
        await prisma.eventRegistration.update({
          where: { id: reg.id },
          data: { pickupCode: generatePickupCode() },
        });
        success = true;
      } catch (err: any) {
        // Unique Constraint Violation (i.e. this code already exists)
        // https://www.prisma.io/docs/orm/reference/error-reference#p2002
        if (err.code === 'P2002') {
          attempts++;
        } else {
          // Something unexpected happened, skip updating this entry

          log.error(
            `Failed to assign pickup code to registration ${reg.id}`,
            err,
          );

          break;
        }
      }
    }
  }
}
