'use server';
import prisma from '@/libs/db/prisma';
import { generatePickupCode } from '@/libs/utils/pickup-code';
import { logger } from '@/libs/utils/logger';

/**
 * Generates and assigns a unique pickup code to a registration
 * This should be called when a registration is paid
 */
export async function assignPickupCode(
  registrationId: number,
): Promise<string | null> {
  try {
    const registration = await prisma.eventRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      logger.error('Registration not found', { registrationId });
      return null;
    }

    // If already has a pickup code, return it
    if (registration.pickupCode) {
      return registration.pickupCode;
    }

    // Generate a unique pickup code
    let pickupCode = generatePickupCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const existing = await prisma.eventRegistration.findUnique({
        where: { pickupCode },
      });

      if (!existing) {
        break;
      }

      pickupCode = generatePickupCode();
      attempts++;
    }

    if (attempts === maxAttempts) {
      logger.error('Failed to generate unique pickup code after max attempts');
      return null;
    }

    // Update the registration with the pickup code
    await prisma.eventRegistration.update({
      where: { id: registrationId },
      data: { pickupCode },
    });

    logger.info('Assigned pickup code to registration', {
      registrationId,
      pickupCode,
    });

    return pickupCode;
  } catch (error) {
    logger.error('Error assigning pickup code', error);
    return null;
  }
}

/**
 * Gets or creates a pickup code for a registration
 */
export async function getOrCreatePickupCode(
  registrationId: number,
): Promise<string | null> {
  const registration = await prisma.eventRegistration.findUnique({
    where: { id: registrationId },
    select: { pickupCode: true, paymentCompleted: true },
  });

  if (!registration || !registration.paymentCompleted) {
    return null;
  }

  if (registration.pickupCode) {
    return registration.pickupCode;
  }

  return await assignPickupCode(registrationId);
}
