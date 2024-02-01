import { revalidateTag } from 'next/cache';

export async function POST(request: Request) {
  const auth = request.headers.get('authorization');
  if (!auth || auth !== process.env.REVALIDATE_AUTH) {
    console.log('Unauthorized revalidate request', auth);
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const model = body?.model;
  if (model) {
    console.log(`Revalidating ${model}`);
    revalidateTag(model);
  }

  return new Response('OK');
}
