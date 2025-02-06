import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage';
import { TW } from '@trustwallet/wallet-core';

import { getSuiClient } from '../../sui/client/getSuiClient';
import { ExecuteTxInput } from './ExecuteTxInput';

export const executeSuiTx = async ({
  compiledTx,
}: ExecuteTxInput): Promise<string> => {
  const {
    unsignedTx,
    errorMessage: suiErrorMessage,
    signature: compiledSignature,
  } = TW.Sui.Proto.SigningOutput.decode(compiledTx);

  assertErrorMessage(suiErrorMessage);

  const rpcClient = getSuiClient();

  const { digest } = await rpcClient.executeTransactionBlock({
    transactionBlock: unsignedTx,
    signature: [compiledSignature],
  });

  return digest;
};
