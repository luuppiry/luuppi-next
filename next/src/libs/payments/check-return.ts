import 'server-only';
import { vismapayClient } from '.';
import { logger } from '../utils/logger';

export const checkReturn = async (query: {
  [key: string]: string | string[] | undefined;
}) => {
  const returnCode = query.RETURN_CODE;
  const settled = query.SETTLED;
  const orderId = query.ORDER_NUMBER;

  if (
    typeof returnCode !== 'string' ||
    typeof orderId !== 'string' ||
    (settled && typeof settled !== 'string') // Only given if successful
  ) {
    throw new Error('Invalid query parameters');
  }

  const settledValue = Number(settled);
  const returnCodeValue = Number(returnCode);

  if ((settledValue && isNaN(settledValue)) || isNaN(returnCodeValue)) {
    throw new Error('Invalid return code or settled value');
  }

  // Settled 1 means card was charged (not only authorized)
  // Return code 0 means successful
  const successful = settledValue === 1 && returnCodeValue === 0;

  try {
    await vismapayClient.checkReturn(query);
    return {
      orderId,
      successful,
    };
  } catch (error) {
    logger.error('Error checking return', error);
    throw new Error('Error checking return');
  }
};
