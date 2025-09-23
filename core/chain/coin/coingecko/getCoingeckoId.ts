import { rootApiUrl } from '@core/config'
import { attempt } from '@lib/utils/attempt'
import { queryUrl } from '@lib/utils/query/queryUrl'

import {
  SolanaCoingeckoTokenResponse,
  SolanaFmTokenResponse,
} from './coingeckoToken'

export const getSolanaCoingeckoId = async ({ id }: { id: string }) => {
  const cgResult = await attempt(() =>
    queryUrl<SolanaCoingeckoTokenResponse>(
      `${rootApiUrl}/coingeicko/api/v3/onchain/networks/solana/tokens/${id}`
    )
  )
  if ('data' in cgResult) {
    const coingeckoId =
      cgResult.data?.data?.attributes?.coingecko_coin_id ?? undefined
    if (coingeckoId) return coingeckoId
  }

  const fmResult = await attempt(() =>
    queryUrl<SolanaFmTokenResponse>(`https://api.solana.fm/v1/tokens/${id}`)
  )
  if ('data' in fmResult) {
    const fmId = fmResult.data?.tokenList?.extensions?.coingeckoId
    if (fmId) return fmId
  }

  return undefined
}
