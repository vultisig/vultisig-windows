import { TW } from '@trustwallet/wallet-core';
import { createHash } from 'crypto';

import { Post } from '../../../../wailsjs/go/utils/GoHttp';
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage';
import { CosmosChain } from '../../../model/chain';
import { getCosmosTxBroadcastUrl } from '../../cosmos/cosmosRpcUrl';
import { ExecuteTxInput } from './ExecuteTxInput';

export const executeCosmosTx = async ({
  chain,
  compiledTx,
}: ExecuteTxInput<CosmosChain>): Promise<string> => {
  const output = TW.Cosmos.Proto.SigningOutput.decode(compiledTx);

  assertErrorMessage(output.errorMessage);

  const rawTx = output.serialized;
  const parsedData = JSON.parse(rawTx);
  const txBytes = parsedData.tx_bytes;
  const decodedTxBytes = Buffer.from(txBytes, 'base64');
  const txHash = createHash('sha256')
    .update(decodedTxBytes as any)
    .digest('hex');

  const url = getCosmosTxBroadcastUrl(chain);

  const response = await Post(url, parsedData);

  const data: CosmosTransactionBroadcastResponse = response;

  if (
    data.tx_response?.raw_log &&
    data.tx_response?.raw_log !== '' &&
    data.tx_response?.raw_log !== '[]'
  ) {
    return data.tx_response.raw_log;
  }

  return txHash;
};

interface CosmosTransactionBroadcastResponse {
  tx_response?: {
    code?: number;
    txhash?: string;
    raw_log?: string;
  };
}
