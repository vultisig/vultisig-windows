import { persistQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'

import { useFiatCurrency } from '../../../../../storage/fiatCurrency'
import { getCoinMarketStats } from '../getCoinMarketStats'
import { MarketDataSource } from '../MarketDataSource'

/**
 * Market stats for the coin-detail modal. Only id-routed coins are
 * supported — `/coins/markets` has no contract variant — so the query stays
 * inactive for contract-routed and pool-priced coins and the stats sections
 * are hidden. Fetches on open only; no polling.
 */
export const useCoinMarketStatsQuery = (source: MarketDataSource | null) => {
  const fiatCurrency = useFiatCurrency()

  const id = source && 'id' in source ? source.id : null

  return useQuery({
    queryKey: ['coinMarketStats', { id, fiatCurrency }],
    queryFn: () =>
      getCoinMarketStats({ id: shouldBePresent(id), fiatCurrency }),
    enabled: id !== null,
    ...persistQueryOptions,
    staleTime: convertDuration(1, 'min', 'ms'),
  })
}
