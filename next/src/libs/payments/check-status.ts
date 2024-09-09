import 'server-only';
import { vismapayClient } from '.';
import { logger } from '../utils/logger';

export const checkStatus = async (orderNumber: string) => {
  try {
    const status = await vismapayClient.checkStatus(orderNumber);
    const settled = status.settled;
    const result = status.result;

    const successful = settled === 1 && result === 0;
    const failed = result === 2;

    return {
      successful,
      failed,
    };
  } catch (error) {
    logger.error('Error checking status', error);
    return null;
  }
};
