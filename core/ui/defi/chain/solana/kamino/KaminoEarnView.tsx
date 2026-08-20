import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useDefiPositions } from '@core/ui/storage/defiPositions'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  kaminoShareToTokenValue,
  KaminoTokenAmount,
} from '@vultisig/core-chain/chains/solana/kamino/amount'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { useTranslation } from 'react-i18next'

import { DefiPositionEmptyState } from '../../tabs/DefiPositionEmptyState'
import { DefiPositionErrorState } from '../../tabs/DefiPositionErrorState'
import { KaminoEarnSkeleton } from './KaminoEarnSkeleton'
import { KaminoVaultCard } from './KaminoVaultCard'
import {
  kaminoEarnPositionId,
  kaminoVaultAddressFromPositionId,
} from './positionId'
import { useKaminoPositionsQuery } from './queries/useKaminoPositionsQuery'
import { useKaminoVaultsQuery } from './queries/useKaminoVaultsQuery'
import { kaminoUnderlyingCoin } from './underlyingCoin'

/**
 * Kamino Earn on the Solana DeFi tab: the curated vaults the user has enabled,
 * each with its live 30-day APY and — where the vault holds one — the
 * position's balance, fiat value and lifetime PnL.
 *
 * A position's value is its SHARE balance valued through `tokensPerShare`,
 * never through the metrics endpoint's USD `sharePrice`: the two only coincide
 * on dollar-pegged vaults, and using the wrong one overstates the SOL vault by
 * the token's price.
 */
export const KaminoEarnView = () => {
  const { t } = useTranslation()
  const owner = useCurrentVaultAddress(Chain.Solana)
  const selectedPositions = useDefiPositions(Chain.Solana)

  const vaultsQuery = useKaminoVaultsQuery()
  const positionsQuery = useKaminoPositionsQuery(owner)
  // Deduplicated: the dollar vaults share USDC, and one price is one request.
  const pricesQuery = useCoinPricesQuery({
    coins: Object.values(
      Object.fromEntries(
        (vaultsQuery.data ?? [])
          .map(info => kaminoUnderlyingCoin(info.descriptor))
          .map(coin => [
            coinKeyToString({ chain: coin.chain, id: coin.id }),
            coin,
          ])
      )
    ),
  })

  const selected = new Set(selectedPositions)

  // Answered from stored selection alone, before the vaults resolve: a user
  // who has enabled nothing is not waiting on a network read, and showing
  // them a skeleton that resolves to the opt-in banner reads as a stall.
  const hasEnabledVaults = selectedPositions.some(
    id => kaminoVaultAddressFromPositionId(id) !== undefined
  )
  if (!hasEnabledVaults) {
    return <DefiPositionEmptyState returnTab="earn" />
  }

  return (
    <MatchQuery
      value={vaultsQuery}
      pending={() => <KaminoEarnSkeleton />}
      error={() => <DefiPositionErrorState onRetry={vaultsQuery.refetch} />}
      success={vaults => {
        const enabled = vaults.filter(info =>
          selected.has(kaminoEarnPositionId(info.descriptor.address))
        )

        if (enabled.length === 0) {
          return <DefiPositionEmptyState returnTab="earn" />
        }

        return (
          <VStack gap={12} style={{ marginBottom: 100 }}>
            {enabled.map(info => {
              const coin = kaminoUnderlyingCoin(info.descriptor)
              const position = positionsQuery.data?.[info.descriptor.address]
              const tokenValue: KaminoTokenAmount | undefined = position
                ? kaminoShareToTokenValue({
                    shares: position.shares.total,
                    tokensPerShare: info.tokensPerShare,
                    tokenDecimals: coin.decimals,
                  })
                : undefined

              return (
                <KaminoVaultCard
                  key={info.descriptor.address}
                  info={info}
                  coin={coin}
                  priceUsd={
                    pricesQuery.data?.[
                      coinKeyToString({ chain: coin.chain, id: coin.id })
                    ] ?? 0
                  }
                  tokenAmount={
                    tokenValue
                      ? fromChainAmount(tokenValue.baseUnits, coin.decimals)
                      : 0
                  }
                  pnlToken={position?.pnlToken}
                />
              )
            })}
            {positionsQuery.error ? (
              <Text size={12} color="shy">
                {t('kamino_earn_positions_unavailable')}
              </Text>
            ) : null}
          </VStack>
        )
      }}
    />
  )
}
