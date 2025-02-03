import { TW } from '@trustwallet/wallet-core';
import Long from 'long';

import { assertField } from '@lib/utils/record/assertField';
import { GetPreSignedInputDataInput } from './GetPreSignedInputDataInput';

export const getRipplePreSignedInputData = ({
  keysignPayload,
  chainSpecific,
}: GetPreSignedInputDataInput<'rippleSpecific'>) => {
  const coin = assertField(keysignPayload, 'coin');

  const pubKeyData = Buffer.from(coin.hexPublicKey, 'hex');

  const { gas, sequence } = chainSpecific;

  const input = TW.Ripple.Proto.SigningInput.create({
    account: coin.address,
    fee: Long.fromString(gas.toString()),
    sequence: Number(sequence),
    publicKey: new Uint8Array(pubKeyData),
    opPayment: TW.Ripple.Proto.OperationPayment.create({
      destination: keysignPayload.toAddress,
      amount: Long.fromString(keysignPayload.toAmount),
      destinationTag: keysignPayload.memo
        ? Long.fromString(keysignPayload.memo)
        : undefined,
    }),
  });

  return TW.Ripple.Proto.SigningInput.encode(input).finish();
};
