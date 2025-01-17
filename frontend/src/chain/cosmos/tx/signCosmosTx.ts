import { TW } from '@trustwallet/wallet-core';
import {
  PublicKey,
  WalletCore,
} from '@trustwallet/wallet-core/dist/src/wallet-core';
import { createHash } from 'crypto';

import { tss } from '../../../../wailsjs/go/models';
import { CosmosChain } from '../../../model/chain';
import { SignedTransaction } from '../../tx/SignedTransaction';
import { getPreSigningHashes } from '../../tx/utils/getPreSigningHashes';
import { assertSignature } from '../../utils/assertSignature';
import { generateSignatureWithRecoveryId } from '../../utils/generateSignatureWithRecoveryId';
import { getCoinType } from '../../walletCore/getCoinType';
import { hexEncode } from '../../walletCore/hexEncode';

type Input = {
  publicKey: PublicKey;
  txInputData: Uint8Array;
  signatures: Record<string, tss.KeysignResponse>;
  walletCore: WalletCore;
  chain: CosmosChain;
};

export const signCosmosTx = ({
  publicKey,
  txInputData,
  signatures,
  walletCore,
  chain,
}: Input): SignedTransaction => {
  const publicKeyData = publicKey.data();

  const [dataHash] = getPreSigningHashes({
    walletCore,
    txInputData,
    chain,
  });

  const allSignatures = walletCore.DataVector.create();
  const publicKeys = walletCore.DataVector.create();

  const signature = generateSignatureWithRecoveryId({
    walletCore,
    signature: signatures[hexEncode({ value: dataHash, walletCore })],
  });

  assertSignature({
    publicKey,
    message: dataHash,
    signature,
  });

  allSignatures.add(signature);
  publicKeys.add(publicKeyData);

  const coinType = getCoinType({ walletCore, chain });

  const compileWithSignatures =
    walletCore.TransactionCompiler.compileWithSignatures(
      coinType,
      txInputData,
      allSignatures,
      publicKeys
    );
  const output = TW.Cosmos.Proto.SigningOutput.decode(compileWithSignatures);

  const rawTx = output.serialized;
  const parsedData = JSON.parse(rawTx);
  const txBytes = parsedData.tx_bytes;
  const decodedTxBytes = Buffer.from(txBytes, 'base64');
  const txHash = createHash('sha256')
    .update(decodedTxBytes as any)
    .digest('hex');

  return {
    rawTx,
    txHash,
  };
};
