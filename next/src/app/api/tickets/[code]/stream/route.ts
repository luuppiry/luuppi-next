import { redisClient } from '@/libs/db/redis';
import { logger } from '@/libs/utils/logger';
import type Redis from 'ioredis';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const code = (await params).code;
  const eventName = `ticket-updated-${code}`;

  let subscriber: Redis;

  try {
    subscriber = redisClient.duplicate();
  } catch {
    return new Response('Service unavailable', { status: 503 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(':ok\n\n');

      try {
        await subscriber.subscribe(eventName);
      } catch (error) {
        logger.error('Redis Subscription Error:', error);
        controller.error(error);
      }

      const push = (channel: string, message: string) => {
        if (channel === eventName) {
          controller.enqueue(`data: ${message}\n\n`);
        }
      };

      subscriber.on('message', push);

      request.signal.addEventListener('abort', async () => {
        subscriber.off('message', push);
        await subscriber.unsubscribe(eventName);
        await subscriber.quit();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
