import { withoutNullOrUndefined } from '@lib/utils/array/withoutNullOrUndefined';
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage';
import { TW, WalletCore } from '@trustwallet/wallet-core';

import { Chain, ChainKind, getChainKind } from '../../../model/chain';
import { getCoinType } from '../../walletCore/getCoinType';

type Input = {
  walletCore: WalletCore;
  chain: Chain;
  txInputData: Uint8Array;
};

const decoders: Record<
  ChainKind,
  (
    preHashes: Uint8Array
  ) =>
    | TW.Bitcoin.Proto.PreSigningOutput
    | TW.Solana.Proto.PreSigningOutput
    | TW.TxCompiler.Proto.PreSigningOutput
> = {
  utxo: TW.Bitcoin.Proto.PreSigningOutput.decode,
  solana: TW.Solana.Proto.PreSigningOutput.decode,
  evm: TW.TxCompiler.Proto.PreSigningOutput.decode,
  cosmos: TW.TxCompiler.Proto.PreSigningOutput.decode,
  polkadot: TW.TxCompiler.Proto.PreSigningOutput.decode,
  ton: TW.TxCompiler.Proto.PreSigningOutput.decode,
  sui: TW.TxCompiler.Proto.PreSigningOutput.decode,
  ripple: TW.TxCompiler.Proto.PreSigningOutput.decode,
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

  const chainKind = getChainKind(chain);

  const decoder = decoders[chainKind];

  const output = decoder(preHashes);

  assertErrorMessage(output.errorMessage);

  if ('hashPublicKeys' in output) {
    return withoutNullOrUndefined(
      output.hashPublicKeys.map(hash => hash?.dataHash)
    );
  }

  const { data } = output;

  if ('dataHash' in output && output.dataHash.length > 0) {
    return [output.dataHash];
  }

  return [data];
};
