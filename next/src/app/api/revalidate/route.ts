import { logger } from '@/libs';
import { revalidateTag } from 'next/cache';

/**
 * Strapi sends webhooks to this endpoint to revalidate
 * pages when content is updated.
 * @param request Request object
 * @returns 200 / 401
 */
export async function POST(request: Request) {
  const auth = request.headers.get('authorization');
  if (!auth || auth !== process.env.REVALIDATE_AUTH) {
    logger.error('Unauthorized revalidate request');
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const model = body?.model;
  if (model) {
    logger.info(`Revalidating ${model}`);
    revalidateTag(model);
  }

  return new Response('OK');
}
