import { TW } from '@trustwallet/wallet-core';

import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage';
import { Endpoint } from '../../../services/Endpoint';
import { callRpc } from '../../rpc/callRpc';
import { ExecuteTxInput } from './ExecuteTxInput';

type SuiExecuteTransactionBlockResult = {
  digest: string;
};

export const executeSuiTx = async ({
  compiledTx,
}: ExecuteTxInput): Promise<string> => {
  const {
    unsignedTx,
    errorMessage: suiErrorMessage,
    signature: compiledSignature,
  } = TW.Sui.Proto.SigningOutput.decode(compiledTx);

  assertErrorMessage(suiErrorMessage);

  const { digest } = await callRpc<SuiExecuteTransactionBlockResult>({
    url: Endpoint.suiServiceRpc,
    method: 'sui_executeTransactionBlock',
    params: [unsignedTx, [compiledSignature]],
  });

  return digest;
};
