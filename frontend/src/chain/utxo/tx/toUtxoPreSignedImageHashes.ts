import { TW } from '@trustwallet/wallet-core';

import { withoutNullOrUndefined } from '../../../lib/utils/array/withoutNullOrUndefined';

type Input = {
  preImageHashes: Uint8Array;
};

export const toUtxoPreSignedImageHashes = ({ preImageHashes }: Input) => {
  const preSignOutputs =
    TW.Bitcoin.Proto.PreSigningOutput.decode(preImageHashes);

  if (preSignOutputs.errorMessage) {
    throw new Error(preSignOutputs.errorMessage);
  }

  return withoutNullOrUndefined(
    preSignOutputs.hashPublicKeys.map(hash => hash?.dataHash)
  ).sort();
};
