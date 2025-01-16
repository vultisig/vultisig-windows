import { extractErrorMsg } from '../../../lib/utils/error/extractErrorMsg';
import { UtxoChain } from '../../../model/chain';
import { getBlockchairBaseUrl } from './getBlockchairBaseUrl';

type BlockchairBroadcastResponse =
  | {
      data: {
        transaction_hash: string;
      } | null;
    }
  | {
      data: null;
      context: {
        error: string;
      };
    };

type BroadcastUtxoTransactionInput = {
  chain: UtxoChain;
  tx: string;
};

export const broadcastUtxoTransaction = async ({
  chain,
  tx,
}: BroadcastUtxoTransactionInput) => {
  const url = `${getBlockchairBaseUrl(chain)}/push/transaction`;

  const response: BlockchairBroadcastResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: tx }),
  }).then(res => res.json());

  if (response.data) {
    return response.data.transaction_hash;
  }

  throw new Error(
    `Failed to broadcast transaction: ${
      'context' in response ? response.context.error : extractErrorMsg(response)
    }`
  );
};
