import prisma from '@/libs/db/prisma';
import { checkReturn } from '@/libs/payments/check-return';
import url from 'url';

export async function GET(request: Request) {
  const queryParams = url.parse(request.url, true).query;

  try {
    const { orderId, successful } = await checkReturn(queryParams);

    // TODO: Cache this query. Result should not change for the same orderId.
    await prisma.payment.update({
      where: {
        orderId,
      },
      data: {
        status: successful ? 'COMPLETED' : 'CANCELLED',
        registration: {
          updateMany: successful
            ? {
                where: {},
                data: {
                  paymentCompleted: successful,
                },
              }
            : undefined,
        },
      },
    });
  } catch (error) {
    return new Response('Error checking return', { status: 400 });
  }

  return new Response('OK', { status: 200 });
}
