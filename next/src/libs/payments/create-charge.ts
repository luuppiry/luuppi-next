import { SupportedLanguage } from '@/models/locale';
import 'server-only';
import { stripe } from '.';
import { logger } from '../utils/logger';

interface Reservation {
  id: string;
  name: string;
  priceInCents: number;
  confirmationTime: string;
}

interface ChargePayment {
  id: string;
  amountInCents: number;
  reservations: Reservation[];
}

export const createCharge = async (
  chargeObj: ChargePayment,
  lang: SupportedLanguage,
  email: string,
): Promise<string> => {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: chargeObj.reservations.map((reservation) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: reservation.name,
          },
          unit_amount: reservation.priceInCents,
        },
        quantity: 1,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${lang}/payment?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${lang}/payment?canceled=true`,
      customer_email: email,
      metadata: {
        orderId: chargeObj.id,
      },
    });

    if (!session.url) {
      throw new Error('No redirect URL');
    }

    return session.url;
  } catch (error) {
    logger.error('Error creating charge', error);
    throw new Error('Failed to create payment session');
  }
};
