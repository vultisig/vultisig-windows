import { WalletCore } from '@trustwallet/wallet-core';
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { tss } from '../../../../wailsjs/go/models';
import { Chain } from '../../../model/chain';
import { assertSignature } from '../../utils/assertSignature';
import { getCoinType } from '../../walletCore/getCoinType';
import { hexEncode } from '../../walletCore/hexEncode';
import { generateSignature } from '../signature/generateSignature';
import { getPreSigningHashes } from '../utils/getPreSigningHashes';

type Input = {
  publicKey: PublicKey;
  txInputData: Uint8Array;
  signatures: Record<string, tss.KeysignResponse>;
  chain: Chain;
  walletCore: WalletCore;
};

export const compileTx = ({
  publicKey,
  txInputData,
  signatures,
  chain,
  walletCore,
}: Input) => {
  const allSignatures = walletCore.DataVector.create();
  const publicKeys = walletCore.DataVector.create();

  const hashes = getPreSigningHashes({
    walletCore: walletCore,
    txInputData,
    chain: chain,
  });

  hashes.forEach(hash => {
    const signature = generateSignature({
      walletCore,
      signature: signatures[hexEncode({ value: hash, walletCore })],
      chain,
    });

    assertSignature({
      publicKey,
      message: hash,
      signature,
      chain,
    });

    allSignatures.add(signature);
    publicKeys.add(publicKey.data());
  });

  const coinType = getCoinType({
    chain,
    walletCore,
  });

  return walletCore.TransactionCompiler.compileWithSignatures(
    coinType,
    txInputData,
    allSignatures,
    publicKeys
  );
};
