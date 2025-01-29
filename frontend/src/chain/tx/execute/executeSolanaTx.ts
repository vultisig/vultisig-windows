import { TW } from '@trustwallet/wallet-core';

import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import SignatureProvider from '../../../services/Blockchain/signature-provider';
import { RpcServiceSolana } from '../../../services/Rpc/solana/RpcServiceSolana';
import { assertSignature } from '../../utils/assertSignature';
import { getCoinType } from '../../walletCore/getCoinType';
import { getPreSigningHashes } from '../utils/getPreSigningHashes';
import { ExecuteTxInput } from './ExecuteTxInput';

export const executeSolanaTx = async ({
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
  const signatureProvider = new SignatureProvider(walletCore, signatures);
  const signature = signatureProvider.getSignature(dataHash);
  assertSignature({
    publicKey,
    message: dataHash,
    signature,
    chain,
  });

  const allSignatures = walletCore.DataVector.create();
  const publicKeys = walletCore.DataVector.create();
  const publicKeyData = publicKey.data();

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

  const { encoded, errorMessage: solanaErrorMessage } =
    TW.Solana.Proto.SigningOutput.decode(compiled);

  assertErrorMessage(solanaErrorMessage);

  const rpcService = new RpcServiceSolana();

  return rpcService.broadcastTransaction(encoded);
};
