import { UtxoBasedChain } from '@core/chain/Chain'
import { attempt } from '@lib/utils/attempt'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { getBlockchairBaseUrl } from '../../../chains/utxo/client/getBlockchairBaseUrl'
import { TxStatusResolver } from '../resolver'

type BlockchairTxResponse = {
  data: Record<
    string,
    {
      transaction: {
        block_id: number | null
      }
    }
  >
}

export const getUtxoTxStatus: TxStatusResolver<UtxoBasedChain> = async ({
  chain,
  hash,
}) => {
  const baseUrl = getBlockchairBaseUrl(chain)
  const url = `${baseUrl}/dashboards/transaction/${hash}`

  const { data: response, error } = await attempt(
    queryUrl<BlockchairTxResponse>(url)
  )

  if (error || !response || !response.data[hash]) {
    return 'pending'
  }

  const tx = response.data[hash].transaction

  if (tx.block_id === null || tx.block_id === -1) {
    return 'pending'
  }

  return 'success'
}
