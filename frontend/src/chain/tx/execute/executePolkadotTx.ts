import { TW } from '@trustwallet/wallet-core';

import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import SignatureProvider from '../../../services/Blockchain/signature-provider';
import { Endpoint } from '../../../services/Endpoint';
import { callRpc } from '../../rpc/callRpc';
import { assertSignature } from '../../utils/assertSignature';
import { getCoinType } from '../../walletCore/getCoinType';
import { ExecuteTxInput } from './ExecuteTxInput';

export const executePolkadotTx = async ({
  publicKey,
  txInputData,
  signatures,
  walletCore,
  chain,
}: ExecuteTxInput): Promise<string> => {
  const publicKeyData = publicKey.data();

  const coinType = getCoinType({
    chain,
    walletCore,
  });

  const preHashes = walletCore.TransactionCompiler.preImageHashes(
    coinType,
    txInputData
  );

  const { data, errorMessage } =
    TW.TxCompiler.Proto.PreSigningOutput.decode(preHashes);

  assertErrorMessage(errorMessage);

  const allSignatures = walletCore.DataVector.create();
  const publicKeys = walletCore.DataVector.create();
  const signatureProvider = new SignatureProvider(walletCore, signatures);
  const signature = signatureProvider.getSignature(data);

  assertSignature({
    publicKey,
    message: data,
    signature,
  });

  allSignatures.add(signature);
  publicKeys.add(publicKeyData);

  const compiled = walletCore.TransactionCompiler.compileWithSignatures(
    coinType,
    txInputData,
    allSignatures,
    publicKeys
  );

  const { errorMessage: polkadotErrorMessage, encoded } =
    TW.Polkadot.Proto.SigningOutput.decode(compiled);

  assertErrorMessage(polkadotErrorMessage);

  const rawTx = walletCore.HexCoding.encode(encoded);

  return callRpc({
    url: Endpoint.polkadotServiceRpc,
    method: 'author_submitExtrinsic',
    params: [rawTx],
  });
};
