import { TW, WalletCore } from '@trustwallet/wallet-core';

import { Chain } from '../../../model/chain';
import { getCoinType } from '../../walletCore/getCoinType';
import { hexEncode } from '../../walletCore/hexEncode';

type Input = {
  walletCore: WalletCore;
  signingInput: TW.Ethereum.Proto.ISigningInput;
  chain: Chain;
};

export const evmSigningInputToPreSignedImageHash = ({
  walletCore,
  signingInput,
  chain,
}: Input) => {
  const encodedInput =
    TW.Ethereum.Proto.SigningInput.encode(signingInput).finish();

  const preHashes = walletCore.TransactionCompiler.preImageHashes(
    getCoinType({
      walletCore,
      chain,
    }),
    encodedInput
  );

  const preSigningOutput =
    TW.TxCompiler.Proto.PreSigningOutput.decode(preHashes);

  return hexEncode({
    value: preSigningOutput.dataHash,
    walletCore,
  });
};
