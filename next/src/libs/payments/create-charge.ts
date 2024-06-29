import { SupportedLanguage } from '@/models/locale';
import {
  VismapayChargePayment,
  VismapayError,
  VismapayErrorType,
} from '@/types/vismapay';
import 'server-only';
import { vismapayClient } from '.';

/**
 * Initializes a VismaPay charge and returns URL to redirect
 * the user to if successful.
 */
export const createCharge = async (
  chargeObj: VismapayChargePayment,
  lang: SupportedLanguage,
  email: string,
): Promise<string> => {
  const charge = {
    amount: chargeObj.amountInCents,
    order_number: chargeObj.id,
    currency: 'EUR',
    payment_method: {
      type: 'e-payment',
      return_url: process.env.NEXT_PUBLIC_BASE_URL + `/${lang}/payment`, // User redirect url
      notify_url: process.env.NEXT_PUBLIC_BASE_URL + '/api/payment', // VismaPay callback url
      language: lang,
      selected: ['banks', 'creditcards', 'wallets'],
    },
    customer: {
      email,
    },
    products: chargeObj.reservations.map((reservation) => ({
      id: reservation.id,
      title: reservation.name,
      count: 1,
      pretax_price: reservation.priceInCents,
      tax: 0,
      price: reservation.priceInCents,
      type: 1,
    })),
  };

  let redirectUrl: string | null = null;
  try {
    const result = await vismapayClient.createCharge(charge);
    const token = result.token;
    redirectUrl = `https://www.vismapay.com/pbwapi/token/${token}`;
  } catch (error) {
    const vismapayError = error as VismapayError;
    if (vismapayError.type) {
      switch (vismapayError.type) {
        case VismapayErrorType.MalformedResponse:
          throw new Error('Malformed response');
        case VismapayErrorType.KeysNotSet:
          throw new Error('Keys not set');
        case VismapayErrorType.InvalidParameters:
          throw new Error('Invalid parameters');
        case VismapayErrorType.ProtocolError:
          throw new Error('Protocol error');
        case VismapayErrorType.MacCheckFailed:
          throw new Error('MAC check failed');
        case VismapayErrorType.ApiReturnedError:
          throw new Error('API returned error');
      }
    }
  }

  if (!redirectUrl) {
    throw new Error('No redirect URL');
  }

  return redirectUrl;
};
