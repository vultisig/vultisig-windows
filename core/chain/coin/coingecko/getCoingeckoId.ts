import { rootApiUrl } from '@core/config'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { SolanaCoingeckoTokenResponse } from './coingeckoToken'

export const getSolanaCoingeckoId = async ({ id }: { id: string }) => {
  const { data } = await queryUrl<SolanaCoingeckoTokenResponse>(
    `${rootApiUrl}/coingeicko/api/v3/onchain/networks/solana/tokens/${id}`
  )

  return data.attributes.coingecko_coin_id ?? undefined
}
