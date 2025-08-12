import { OtherChain, UtxoBasedChain, UtxoChain } from '@core/chain/Chain'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { isInError } from '@lib/utils/error/isInError'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { getBlockchairBaseUrl } from '../../../chains/utxo/client/getBlockchairBaseUrl'
import { DecodedTx } from '../../decode'
import { BroadcastTxResolver } from '../resolver'

type UtxoBasedDecodedTx = DecodedTx<UtxoChain> | DecodedTx<OtherChain.Cardano>

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

export const broadcastUtxoTx: BroadcastTxResolver<UtxoBasedChain> = async ({
  chain,
  tx,
}) => {
  const url = `${getBlockchairBaseUrl(chain)}/push/transaction`

  const response = await queryUrl<BlockchairBroadcastResponse>(url, {
    body: {
      data: Buffer.from((tx as UtxoBasedDecodedTx).encoded).toString('hex'),
    },
  })

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
