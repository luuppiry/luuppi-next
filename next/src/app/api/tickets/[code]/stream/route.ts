import { redisClient } from '@/libs/db/redis';
import { logger } from '@/libs/utils/logger';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const code = (await params).code;
  const eventName = `ticket-updated-${code}`;

  const subscriber = redisClient.duplicate();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(':ok\n\n');

      try {
        await subscriber.subscribe(eventName);
      } catch (error) {
        logger.error('Redis Subscription Error:', error);
        controller.error(error);
      }

      subscriber.on('message', (channel, message) => {
        if (channel === eventName) {
          controller.enqueue(`data: ${message}\n\n`);
        }
      });

      request.signal.addEventListener('abort', async () => {
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
