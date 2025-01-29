import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { match } from '../../lib/utils/match';
import { Chain, getChainKind, signatureFormatRecord } from '../../model/chain';

type Input = {
  publicKey: PublicKey;
  message: Uint8Array;
  signature: Uint8Array;
  chain: Chain;
};

export const assertSignature = ({
  publicKey,
  message,
  signature,
  chain,
}: Input) => {
  const isValid = match(signatureFormatRecord[getChainKind(chain)], {
    raw: () => publicKey.verify(signature, message),
    der: () => publicKey.verifyAsDER(signature, message),
  });

  if (!isValid) {
    throw new Error(
      'Signature verification failed: The provided signature does not match the message or public key.'
    );
  }
};
