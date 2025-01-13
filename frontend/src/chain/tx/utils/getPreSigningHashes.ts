import { TW, WalletCore } from '@trustwallet/wallet-core';

import { isOneOf } from '../../../lib/utils/array/isOneOf';
import { withoutNullOrUndefined } from '../../../lib/utils/array/withoutNullOrUndefined';
import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import { Chain, UtxoChain } from '../../../model/chain';
import { getCoinType } from '../../walletCore/getCoinType';

type Input = {
  walletCore: WalletCore;
  chain: Chain;
  txInputData: Uint8Array;
};

export const getPreSigningHashes = ({
  walletCore,
  txInputData,
  chain,
}: Input) => {
  const preHashes = walletCore.TransactionCompiler.preImageHashes(
    getCoinType({
      walletCore,
      chain,
    }),
    txInputData
  );

  if (isOneOf(chain, Object.values(UtxoChain))) {
    const { errorMessage, hashPublicKeys } =
      TW.Bitcoin.Proto.PreSigningOutput.decode(preHashes);

    assertErrorMessage(errorMessage);

    return withoutNullOrUndefined(hashPublicKeys.map(hash => hash?.dataHash));
  }

  const { errorMessage, dataHash, data } =
    TW.TxCompiler.Proto.PreSigningOutput.decode(preHashes);

  assertErrorMessage(errorMessage);

  if (dataHash.length === 0) {
    if (chain === Chain.Sui) {
      return [walletCore.Hash.blake2b(data, 32)];
    }

    return [data];
  }

  return [dataHash];
};
