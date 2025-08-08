import { Chain } from '@core/chain/Chain'
import { knownTokens } from '@core/chain/coin/knownTokens'

export function decorateCoinFromKnownTokens(
  chain: Chain,
  id: string | undefined,
  coin: {
    ticker?: string
    decimals?: number
    logo?: string
    priceProviderId?: string
  }
) {
  if (!id) return coin
  const entry = knownTokens[chain]?.find(
    t => t.id?.toLowerCase() === id.toLowerCase()
  )
  if (!entry) return coin
  return {
    ...coin,
    ticker: coin.ticker ?? entry.ticker,
    decimals: coin.decimals ?? entry.decimals,
    logo: coin.logo ?? entry.logo,
    priceProviderId: coin.priceProviderId ?? entry.priceProviderId,
  }
}
