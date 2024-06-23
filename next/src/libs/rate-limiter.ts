import { redisClient } from './db/redis';
import { logger } from './utils/logger';

export async function isRateLimited(id: string, event: string, limit = 10) {
  const key = `rate-limit:${event}:${id}`;
  const hasVerification = await redisClient.get(key);

  if (hasVerification && parseInt(hasVerification) >= limit) {
    logger.error(`${event}: Too many requests, rate limited`);
    return parseInt(hasVerification);
  }
  return null;
}

export async function updateRateLimitCounter(
  id: string,
  event: string,
  expiration = 1800,
) {
  const key = `rate-limit:${event}:${id}`;
  const hasVerification = await redisClient.get(key);
  const currentVerification = hasVerification ? parseInt(hasVerification) : 0;

  if (hasVerification) {
    const currentExpiration = await redisClient.ttl(key);
    expiration = currentExpiration > 0 ? currentExpiration : expiration;
  }

  await redisClient.set(key, currentVerification + 1, 'EX', expiration);
}
