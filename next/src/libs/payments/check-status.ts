import 'server-only';
import { stripe } from '.';
import { logger } from '../utils/logger';

export const checkStatus = async (orderId: string) => {
  try {
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: orderId,
    });

    const session = sessions.data[0];
    if (!session) {
      return null;
    }

    return {
      successful: session.payment_status === 'paid',
      failed: session.payment_status === 'unpaid',
    };
  } catch (error) {
    logger.error('Error checking payment status', error);
    return null;
  }
};
