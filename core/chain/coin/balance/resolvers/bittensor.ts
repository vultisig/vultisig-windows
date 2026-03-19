import { bittensorConfig } from '@core/chain/chains/bittensor/config'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { CoinBalanceResolver } from '../resolver'

type TaostatsAccountResponse = {
  pagination: { total_items: number }
  data: Array<{
    address: { ss58: string; hex: string }
    balance_free: string
    balance_total: string
  }>
}

export const getBittensorCoinBalance: CoinBalanceResolver = async input => {
  const response = await queryUrl<TaostatsAccountResponse>(
    `${bittensorConfig.taostatsApiUrl}/account/latest/v1?address=${input.address}&network=finney`,
    {
      headers: {
        Authorization: bittensorConfig.taostatsApiKey,
      },
    }
  )

  if (!response.data || response.data.length === 0) {
    return BigInt(0)
  }

  // balance_free is in RAO (smallest unit, 10^9 per TAO)
  return BigInt(response.data[0].balance_free)
}
