import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { match } from '../../lib/utils/match';

type SignatureFormat = 'raw' | 'der';

type Input = {
  publicKey: PublicKey;
  message: Uint8Array;
  signature: Uint8Array;
  signatureFormat?: SignatureFormat;
};

export const assertSignature = ({
  publicKey,
  message,
  signature,
  signatureFormat = 'raw',
}: Input) => {
  const isValid = match(signatureFormat, {
    raw: () => publicKey.verify(signature, message),
    der: () => publicKey.verifyAsDER(signature, message),
  });

  if (!isValid) {
    throw new Error(
      'Signature verification failed: The provided signature does not match the message or public key.'
    );
  }
};
