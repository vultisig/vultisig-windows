import { TW } from '@trustwallet/wallet-core';

import { UtxoChain } from '../../../model/chain';
import SignatureProvider from '../../../services/Blockchain/signature-provider';
import { assertSignature } from '../../utils/assertSignature';
import { broadcastUtxoTransaction } from '../../utxo/blockchair/broadcastUtxoTransaction';
import { getCoinType } from '../../walletCore/getCoinType';
import { hexEncode } from '../../walletCore/hexEncode';
import { getPreSigningHashes } from '../utils/getPreSigningHashes';
import { ExecuteTxInput } from './ExecuteTxInput';

export const executeUtxoTx = async ({
  publicKey,
  txInputData,
  signatures,
  walletCore,
  chain,
}: ExecuteTxInput): Promise<string> => {
  const allSignatures = walletCore.DataVector.create();
  const publicKeys = walletCore.DataVector.create();
  const signatureProvider = new SignatureProvider(walletCore, signatures);
  const hashes = getPreSigningHashes({
    walletCore: walletCore,
    txInputData,
    chain: chain,
  });
  hashes.forEach(hash => {
    const signature = signatureProvider.getDerSignature(hash);

    assertSignature({
      publicKey,
      message: hash,
      signature,
      signatureFormat: 'der',
    });

    allSignatures.add(signature);
    publicKeys.add(publicKey.data());
  });

  const coinType = getCoinType({
    chain,
    walletCore,
  });

  const compileWithSignatures =
    walletCore.TransactionCompiler.compileWithSignatures(
      coinType,
      txInputData,
      allSignatures,
      publicKeys
    );
  const output = TW.Bitcoin.Proto.SigningOutput.decode(compileWithSignatures);

  await broadcastUtxoTransaction({
    chain: chain as UtxoChain,
    tx: hexEncode({
      value: output.encoded,
      walletCore: walletCore,
    }),
  });

  return output.transactionId;
};
