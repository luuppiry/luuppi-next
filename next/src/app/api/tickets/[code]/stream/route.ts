import { ticketEmitter } from '@/libs/sse-emitter';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const code = (await params).code;

  const stream = new ReadableStream({
    start(controller) {
      const listener = (data: any) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      const eventName = `ticket-updated-${code}`;
      ticketEmitter.on(eventName, listener);

      request.signal.addEventListener('abort', () => {
        ticketEmitter.off(eventName, listener);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
