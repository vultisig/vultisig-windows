import { TW } from '@trustwallet/wallet-core';

import { Post } from '../../../../wailsjs/go/utils/GoHttp';
import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import SignatureProvider from '../../../services/Blockchain/signature-provider';
import { Endpoint } from '../../../services/Endpoint';
import { assertSignature } from '../../utils/assertSignature';
import { getCoinType } from '../../walletCore/getCoinType';
import { getPreSigningHashes } from '../utils/getPreSigningHashes';
import { ExecuteTxInput } from './ExecuteTxInput';

export const executeTonTx = async ({
  publicKey,
  txInputData,
  signatures,
  walletCore,
  chain,
}: ExecuteTxInput): Promise<string> => {
  const [dataHash] = getPreSigningHashes({
    walletCore,
    txInputData,
    chain,
  });

  const allSignatures = walletCore.DataVector.create();
  const publicKeys = walletCore.DataVector.create();
  const signatureProvider = new SignatureProvider(walletCore, signatures);
  const signature = signatureProvider.getSignature(dataHash);

  assertSignature({
    publicKey,
    message: dataHash,
    signature,
    chain,
  });

  const publicKeyData = publicKey.data();

  const coinType = getCoinType({
    chain,
    walletCore,
  });

  allSignatures.add(signature);
  publicKeys.add(publicKeyData);

  const compiled = walletCore.TransactionCompiler.compileWithSignatures(
    coinType,
    txInputData,
    allSignatures,
    publicKeys
  );

  const output = TW.TheOpenNetwork.Proto.SigningOutput.decode(compiled);

  assertErrorMessage(output.errorMessage);

  const response = await Post(Endpoint.broadcastTonTransaction(), {
    boc: output.encoded,
  });

  return Buffer.from(response.result.hash, 'base64').toString('hex');
};
