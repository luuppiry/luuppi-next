import Redis from 'ioredis';
import { logger } from '../utils/logger';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';

const log = logger.child('lib:redis');

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  lazyConnect: true,
});

redisClient.on('error', (err) => log.error('Redis error', err));

// https://github.com/vercel/next.js/blob/canary/packages/next/src/shared/lib/constants.ts
if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
  log.info('Connecting to Redis');
  redisClient.connect();
}

export { redisClient };
