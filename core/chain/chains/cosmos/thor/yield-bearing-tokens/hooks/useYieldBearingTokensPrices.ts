import { useQuery } from '@tanstack/react-query'

import { fetchNavPerShare } from '../services/fetchNavPerShare'

const endpoints: Record<string, string> = {
  yRUNE:
    'https://thornode-mainnet-api.bryanlabs.net/cosmwasm/wasm/v1/contract/thor1mlphkryw5g54yfkrp6xpqzlpv4f8wh6hyw27yyg4z2els8a9gxpqhfhekt/smart/eyJzdGF0dXMiOiB7fX0=',
  yTCY: 'https://thornode-mainnet-api.bryanlabs.net/cosmwasm/wasm/v1/contract/thor1h0hr0rm3dawkedh44hlrmgvya6plsryehcr46yda2vj0wfwgq5xqrs86px/smart/eyJzdGF0dXMiOiB7fX0=',
}

type YPrices = Record<string, number | undefined>

export const useYieldBearingTokensPrices = (tickers: string[]) => {
  const wanted = tickers.filter(t => t in endpoints).sort()
  const enabled = wanted.length > 0

  return useQuery<YPrices>({
    queryKey: ['yVaultPrices', ...wanted],
    enabled,
    queryFn: async () => {
      const pairs = await Promise.all(
        wanted.map(
          async t => [t, await fetchNavPerShare(endpoints[t])] as const
        )
      )
      return Object.fromEntries(pairs)
    },
  })
}
