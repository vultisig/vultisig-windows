import { TW } from '@trustwallet/wallet-core';

import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage';
import { RpcServiceSolana } from '../../../services/Rpc/solana/RpcServiceSolana';
import { ExecuteTxInput } from './ExecuteTxInput';

export const executeSolanaTx = async ({
  compiledTx,
}: ExecuteTxInput): Promise<string> => {
  const { encoded, errorMessage: solanaErrorMessage } =
    TW.Solana.Proto.SigningOutput.decode(compiledTx);

  assertErrorMessage(solanaErrorMessage);

  const rpcService = new RpcServiceSolana();

  return rpcService.broadcastTransaction(encoded);
};
