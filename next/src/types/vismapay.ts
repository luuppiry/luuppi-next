/* eslint-disable no-unused-vars */

export interface VismapayChargePayment {
  amountInCents: number;
  id: string;
  reservations: {
    id: string;
    confirmationTime: string;
    name: string;
    priceInCents: number;
  }[];
}

export enum VismapayErrorType {
  MalformedResponse = 1,
  KeysNotSet = 2,
  InvalidParameters = 3,
  ProtocolError = 4,
  MacCheckFailed = 5,
  ApiReturnedError = 6,
}

export interface VismapayError {
  type: VismapayErrorType;
  error: any;
  result: any;
}
