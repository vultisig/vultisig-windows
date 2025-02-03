import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { match } from '@lib/utils/match';
import { SignatureFormat } from '../../model/chain';

type Input = {
  publicKey: PublicKey;
  message: Uint8Array;
  signature: Uint8Array;
  signatureFormat: SignatureFormat;
};

export const assertSignature = ({
  publicKey,
  message,
  signature,
  signatureFormat,
}: Input) => {
  const isValid = match(signatureFormat, {
    raw: () => publicKey.verify(signature, message),
    rawWithRecoveryId: () => publicKey.verify(signature, message),
    der: () => publicKey.verifyAsDER(signature, message),
  });

  if (!isValid) {
    throw new Error(
      'Signature verification failed: The provided signature does not match the message or public key.'
    );
  }
};
