import { TW } from '@trustwallet/wallet-core';

import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import SignatureProvider from '../../../services/Blockchain/signature-provider';
import { RpcServiceSolana } from '../../../services/Rpc/solana/RpcServiceSolana';
import { assertSignature } from '../../utils/assertSignature';
import { getCoinType } from '../../walletCore/getCoinType';
import { ExecuteTxInput } from './ExecuteTxInput';

export const executeSolanaTx = async ({
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

  const { errorMessage, data } =
    TW.Solana.Proto.PreSigningOutput.decode(preHashes);

  assertErrorMessage(errorMessage);

  const allSignatures = walletCore.DataVector.create();
  const publicKeys = walletCore.DataVector.create();
  const signatureProvider = new SignatureProvider(walletCore, signatures);
  const signature = signatureProvider.getSignature(data);

  assertSignature({
    publicKey,
    message: data,
    signature,
    chain,
  });

  allSignatures.add(signature);
  publicKeys.add(publicKeyData);

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
