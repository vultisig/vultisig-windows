import { TW } from '@trustwallet/wallet-core';

import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import SignatureProvider from '../../../services/Blockchain/signature-provider';
import { Endpoint } from '../../../services/Endpoint';
import { callRpc } from '../../rpc/callRpc';
import { assertSignature } from '../../utils/assertSignature';
import { getCoinType } from '../../walletCore/getCoinType';
import { getPreSigningHashes } from '../utils/getPreSigningHashes';
import { ExecuteTxInput } from './ExecuteTxInput';

type SuiExecuteTransactionBlockResult = {
  digest: string;
};

export const executeSuiTx = async ({
  publicKey,
  txInputData,
  signatures,
  walletCore,
  chain,
}: ExecuteTxInput): Promise<string> => {
  const publicKeyData = publicKey.data();

  const allSignatures = walletCore.DataVector.create();
  const publicKeys = walletCore.DataVector.create();
  const signatureProvider = new SignatureProvider(walletCore, signatures);

  const [dataHash] = getPreSigningHashes({
    walletCore: walletCore,
    txInputData,
    chain: chain,
  });

  const signature = signatureProvider.getSignature(dataHash);

  assertSignature({
    publicKey,
    signature,
    message: dataHash,
    chain,
  });

  allSignatures.add(signature);
  publicKeys.add(publicKeyData);

  const coinType = getCoinType({
    chain,
    walletCore,
  });

  const compiled = walletCore.TransactionCompiler.compileWithSignatures(
    coinType,
    txInputData,
    allSignatures,
    publicKeys
  );

  const {
    unsignedTx,
    errorMessage: suiErrorMessage,
    signature: compiledSignature,
  } = TW.Sui.Proto.SigningOutput.decode(compiled);

  assertErrorMessage(suiErrorMessage);

  const { digest } = await callRpc<SuiExecuteTransactionBlockResult>({
    url: Endpoint.suiServiceRpc,
    method: 'sui_executeTransactionBlock',
    params: [unsignedTx, [compiledSignature]],
  });

  return digest;
};
