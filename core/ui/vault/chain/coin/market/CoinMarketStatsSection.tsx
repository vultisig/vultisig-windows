import { CoinMarketStats } from '@core/ui/chain/coin/price/market/getCoinMarketStats'
import { resolveMarketDataSource } from '@core/ui/chain/coin/price/market/MarketDataSource'
import { useCoinMarketStatsQuery } from '@core/ui/chain/coin/price/market/queries/useCoinMarketStatsQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { VaultChainCoin } from '@core/ui/vault/queries/useVaultChainCoinsQuery'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { CoinDetailSection } from './CoinDetailSection'
import { CoinMarketStatRow } from './CoinMarketStatRow'
import { CoinMarketStatsSectionSkeleton } from './CoinMarketStatsSectionSkeleton'

type CoinMarketStatsSectionProps = {
  coin: VaultChainCoin
}

/**
 * Market cap, rank, volume, FDV and supply for coins with a CoinGecko id.
 * Hidden for contract-routed tokens (the stats endpoint is id-only) and
 * pool-priced coins; rows with missing upstream data are omitted.
 */
export const CoinMarketStatsSection = ({
  coin,
}: CoinMarketStatsSectionProps) => {
  const { t } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()
  const { priceProviderId } = useCurrentVaultCoin(coin)

  const source = resolveMarketDataSource({
    chain: coin.chain,
    id: coin.id,
    priceProviderId,
  })

  const statsQuery = useCoinMarketStatsQuery(source)

  if (!source || !('id' in source)) return null

  const renderRows = (stats: CoinMarketStats) => {
    const rows: { label: string; value: ReactNode }[] = []

    if (stats.marketCap !== null) {
      rows.push({
        label: t('market_cap'),
        value: formatFiatAmount(stats.marketCap),
      })
    }
    if (stats.marketCapRank !== null) {
      rows.push({
        label: t('market_cap_rank'),
        value: `#${stats.marketCapRank}`,
      })
    }
    if (stats.totalVolume !== null) {
      rows.push({
        label: t('volume_24h'),
        value: formatFiatAmount(stats.totalVolume),
      })
    }
    if (stats.fullyDilutedValuation !== null) {
      rows.push({
        label: t('fully_diluted_valuation'),
        value: formatFiatAmount(stats.fullyDilutedValuation),
      })
    }
    if (stats.circulatingSupply !== null) {
      rows.push({
        label: t('circulating_supply'),
        value: formatAmount(stats.circulatingSupply, { ticker: coin.ticker }),
      })
    }
    if (stats.maxSupply !== null) {
      rows.push({
        label: t('max_supply'),
        value: formatAmount(stats.maxSupply, { ticker: coin.ticker }),
      })
    }

    if (rows.length === 0) return null

    return (
      <CoinDetailSection title={t('market_stats')}>
        {rows.map(({ label, value }) => (
          <CoinMarketStatRow key={label} label={label} value={value} />
        ))}
      </CoinDetailSection>
    )
  }

  return (
    <MatchQuery
      value={statsQuery}
      pending={() => (
        <CoinMarketStatsSectionSkeleton title={t('market_stats')} />
      )}
      success={renderRows}
    />
  )
}
