import { UtxoBasedChain } from '@core/chain/Chain'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { isInError } from '@lib/utils/error/isInError'

import { getBlockchairBaseUrl } from './getBlockchairBaseUrl'

type BlockchairBroadcastResponse =
  | {
      data: {
        transaction_hash: string
      } | null
    }
  | {
      data: null
      context: {
        error: string
      }
    }

type BroadcastUtxoTransactionInput = {
  chain: UtxoBasedChain
  tx: string
}

export const broadcastUtxoTransaction = async ({
  chain,
  tx,
}: BroadcastUtxoTransactionInput) => {
  const url = `${getBlockchairBaseUrl(chain)}/push/transaction`

  console.log('broadcastUtxoTransaction input ', tx)

  const response: BlockchairBroadcastResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: tx }),
  }).then(res => res.json())

  console.log('broadcastUtxoTransaction response', response)

  if (response.data) {
    return response.data.transaction_hash
  }

  const error =
    'context' in response ? response.context.error : extractErrorMsg(response)

  if (
    isInError(
      error,
      'BadInputsUTxO',
      'timed out',
      'txn-mempool-conflict',
      'already known'
    )
  ) {
    return null
  }

  throw new Error(`Failed to broadcast transaction: ${extractErrorMsg(error)}`)
}
