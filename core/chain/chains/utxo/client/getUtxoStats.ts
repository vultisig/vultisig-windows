import { UtxoChain } from '@core/chain/Chain'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { getBlockchairBaseUrl } from './getBlockchairBaseUrl'

type BlockchairStatsResponse = {
  data: {
    suggested_transaction_fee_per_byte_sat: number
  }
}

export const getUtxoStats = (chain: UtxoChain) => {
  const url = `${getBlockchairBaseUrl(chain)}/stats`

  return queryUrl<BlockchairStatsResponse>(url)
}
