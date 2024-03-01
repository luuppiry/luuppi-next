import { createClient } from 'redis';
import { logger } from '../utils/logger';

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST!,
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  },
});

redisClient.on('error', (err) => logger.error(err));

if (!redisClient.isOpen) {
  redisClient.connect();
}

export { redisClient };
