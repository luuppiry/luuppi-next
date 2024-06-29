// @ts-expect-error - No types available :(
import vismapay from 'visma-pay';

vismapay.setPrivateKey(process.env.VISMAPAY_PRIVATE_KEY);
vismapay.setApiKey(process.env.VISMAPAY_API_KEY);

export const vismapayClient = vismapay;
