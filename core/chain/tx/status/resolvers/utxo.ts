import { UtxoBasedChain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
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
        fee?: number
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
    return { status: 'pending' }
  }

  const tx = response.data[hash].transaction

  if (tx.block_id === null || tx.block_id === -1) {
    return { status: 'pending' }
  }

  const feeCoin = chainFeeCoin[chain]
  const receipt =
    tx.fee != null && tx.fee >= 0
      ? {
          feeAmount: BigInt(tx.fee),
          feeDecimals: feeCoin.decimals,
          feeTicker: feeCoin.ticker,
        }
      : undefined

  return { status: 'success', receipt }
}
