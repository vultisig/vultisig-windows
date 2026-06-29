import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { cosmosStakedFiat } from '@core/ui/chain/cosmos/staking/cosmosStakedFiat'
import { useCosmosDelegationsQuery } from '@core/ui/chain/cosmos/staking/queries/useCosmosDelegationsQuery'
import { useIsCircleIncluded } from '@core/ui/storage/circleVisibility'
import { useTronAccountResourcesQuery } from '@core/ui/vault/chain/tron/useTronAccountResourcesQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Chain } from '@vultisig/core-chain/Chain'
import { sunToTrx } from '@vultisig/core-chain/chains/tron/resources'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { sum } from '@vultisig/lib-utils/array/sum'
import { useMemo } from 'react'

import { useDefiChains } from '../../../storage/defiChains'
import { useDefiPositions } from '../../../storage/defiPositions'
import { tronDefiCoins } from '../../chain/queries/tokens'
import { useMayaDefiPositionsQuery } from '../../chain/queries/useMayaDefiPositionsQuery'
import { useThorchainDefiPositionsQuery } from '../../chain/queries/useThorchainDefiPositionsQuery'
import { aggregateDefiPositions } from '../../chain/services/defiPositionAggregator'
import { useCircleAccountUsdcFiatBalanceQuery } from '../../protocols/circle/queries/useCircleAccountUsdcFiatBalanceQuery'

export type DefiChainPortfolio = {
  chain: Chain
  totalFiat: number
  positionsWithBalanceCount: number
  isLoading: boolean
}

export const useDefiChainPortfolios = () => {
  const enabledChains = useDefiChains()
  const thorchainSelectedPositions = useDefiPositions(Chain.THORChain)
  const mayaSelectedPositions = useDefiPositions(Chain.MayaChain)
  const thorchainQuery = useThorchainDefiPositionsQuery()
  const mayaQuery = useMayaDefiPositionsQuery({
    enabled: enabledChains.includes(Chain.MayaChain),
  })
  const tronResourcesQuery = useTronAccountResourcesQuery()
  const tronPricesQuery = useCoinPricesQuery({ coins: tronDefiCoins })

  // Terra-family native staking. Per-chain fiat = sum(staked uluna) ÷
  // 10^decimals × LUNA/LUNC USD price. Prices are routed via the fee
  // coin's `priceProviderId` (e.g. `terra-luna-2`) — same feed the
  // `CosmosDelegationsView` chain page uses, so the rollup and the
  // chain-detail banner stay in sync.
  const terraAddress = useCurrentVaultAddress(Chain.Terra)
  const terraClassicAddress = useCurrentVaultAddress(Chain.TerraClassic)
  const terraDelegationsQuery = useCosmosDelegationsQuery({
    chain: Chain.Terra,
    delegatorAddress: terraAddress ?? '',
  })
  const terraClassicDelegationsQuery = useCosmosDelegationsQuery({
    chain: Chain.TerraClassic,
    delegatorAddress: terraClassicAddress ?? '',
  })
  const terraPricesQuery = useCoinPricesQuery({
    coins: [{ ...chainFeeCoin[Chain.Terra], chain: Chain.Terra }],
  })
  const terraClassicPricesQuery = useCoinPricesQuery({
    coins: [{ ...chainFeeCoin[Chain.TerraClassic], chain: Chain.TerraClassic }],
  })

  // QBTC native staking. Same shape as Terra, but QBTC has no spot-price feed
  // on the testnet, so the fiat rollup is 0 — the position count still surfaces
  // the staked balance in the DeFi tab.
  const qbtcAddress = useCurrentVaultAddress(Chain.QBTC)
  const qbtcDelegationsQuery = useCosmosDelegationsQuery({
    chain: Chain.QBTC,
    delegatorAddress: qbtcAddress ?? '',
  })
  const qbtcPricesQuery = useCoinPricesQuery({
    coins: [{ ...chainFeeCoin[Chain.QBTC], chain: Chain.QBTC }],
  })

  const data = useMemo<DefiChainPortfolio[]>(() => {
    const portfolios: DefiChainPortfolio[] = []

    if (enabledChains.includes(Chain.THORChain)) {
      const aggregates = aggregateDefiPositions({
        chain: Chain.THORChain,
        selectedPositionIds: thorchainSelectedPositions,
        thorchain: thorchainQuery.data,
      })

      portfolios.push({
        chain: Chain.THORChain,
        totalFiat: aggregates.totalFiat,
        positionsWithBalanceCount: aggregates.positionsWithBalanceCount,
        isLoading: thorchainQuery.isPending,
      })
    }

    if (enabledChains.includes(Chain.MayaChain)) {
      const aggregates = aggregateDefiPositions({
        chain: Chain.MayaChain,
        selectedPositionIds: mayaSelectedPositions,
        maya: mayaQuery.data,
      })

      portfolios.push({
        chain: Chain.MayaChain,
        totalFiat: aggregates.totalFiat,
        positionsWithBalanceCount: aggregates.positionsWithBalanceCount,
        isLoading: mayaQuery.isPending,
      })
    }

    if (enabledChains.includes(Chain.Tron)) {
      let totalFiat = 0
      let positionsWithBalanceCount = 0

      if (tronResourcesQuery.data && tronPricesQuery.data) {
        const pendingWithdrawalSun =
          tronResourcesQuery.data.unfreezingEntries.reduce(
            (acc, entry) => acc + entry.unfreezeAmountSun,
            0n
          )
        const totalLockedTrx = sunToTrx(
          tronResourcesQuery.data.frozenForBandwidthSun +
            tronResourcesQuery.data.frozenForEnergySun +
            pendingWithdrawalSun
        )
        const trxKey = coinKeyToString(tronDefiCoins[0])
        const trxPrice = tronPricesQuery.data[trxKey] ?? 0
        totalFiat = totalLockedTrx * trxPrice
        positionsWithBalanceCount = totalLockedTrx > 0 ? 1 : 0
      }

      portfolios.push({
        chain: Chain.Tron,
        totalFiat,
        positionsWithBalanceCount,
        isLoading: tronResourcesQuery.isPending || tronPricesQuery.isPending,
      })
    }

    if (enabledChains.includes(Chain.Terra)) {
      portfolios.push({
        chain: Chain.Terra,
        totalFiat: cosmosStakedFiat({
          delegations: terraDelegationsQuery.data,
          price:
            terraPricesQuery.data?.[coinKeyToString({ chain: Chain.Terra })],
          decimals: chainFeeCoin[Chain.Terra].decimals,
        }),
        positionsWithBalanceCount: terraDelegationsQuery.data?.length ?? 0,
        isLoading:
          terraDelegationsQuery.isPending || terraPricesQuery.isPending,
      })
    }

    if (enabledChains.includes(Chain.TerraClassic)) {
      portfolios.push({
        chain: Chain.TerraClassic,
        totalFiat: cosmosStakedFiat({
          delegations: terraClassicDelegationsQuery.data,
          price:
            terraClassicPricesQuery.data?.[
              coinKeyToString({ chain: Chain.TerraClassic })
            ],
          decimals: chainFeeCoin[Chain.TerraClassic].decimals,
        }),
        positionsWithBalanceCount:
          terraClassicDelegationsQuery.data?.length ?? 0,
        isLoading:
          terraClassicDelegationsQuery.isPending ||
          terraClassicPricesQuery.isPending,
      })
    }

    if (enabledChains.includes(Chain.QBTC)) {
      portfolios.push({
        chain: Chain.QBTC,
        totalFiat: cosmosStakedFiat({
          delegations: qbtcDelegationsQuery.data,
          price: qbtcPricesQuery.data?.[coinKeyToString({ chain: Chain.QBTC })],
          decimals: chainFeeCoin[Chain.QBTC].decimals,
        }),
        positionsWithBalanceCount: qbtcDelegationsQuery.data?.length ?? 0,
        isLoading: qbtcDelegationsQuery.isPending || qbtcPricesQuery.isPending,
      })
    }

    return portfolios
  }, [
    enabledChains,
    thorchainQuery.data,
    mayaQuery.data,
    thorchainSelectedPositions,
    mayaSelectedPositions,
    thorchainQuery.isPending,
    mayaQuery.isPending,
    tronResourcesQuery.data,
    tronResourcesQuery.isPending,
    tronPricesQuery.data,
    tronPricesQuery.isPending,
    terraDelegationsQuery.data,
    terraDelegationsQuery.isPending,
    terraClassicDelegationsQuery.data,
    terraClassicDelegationsQuery.isPending,
    terraPricesQuery.data,
    terraPricesQuery.isPending,
    terraClassicPricesQuery.data,
    terraClassicPricesQuery.isPending,
    qbtcDelegationsQuery.data,
    qbtcDelegationsQuery.isPending,
    qbtcPricesQuery.data,
    qbtcPricesQuery.isPending,
  ])

  const isPending =
    (enabledChains.includes(Chain.THORChain) && thorchainQuery.isPending) ||
    (enabledChains.includes(Chain.MayaChain) && mayaQuery.isPending) ||
    (enabledChains.includes(Chain.Tron) &&
      (tronResourcesQuery.isPending || tronPricesQuery.isPending)) ||
    (enabledChains.includes(Chain.Terra) &&
      (terraDelegationsQuery.isPending || terraPricesQuery.isPending)) ||
    (enabledChains.includes(Chain.TerraClassic) &&
      (terraClassicDelegationsQuery.isPending ||
        terraClassicPricesQuery.isPending)) ||
    (enabledChains.includes(Chain.QBTC) &&
      (qbtcDelegationsQuery.isPending || qbtcPricesQuery.isPending))

  const isTronEnabled = enabledChains.includes(Chain.Tron)

  const error =
    thorchainQuery.error ??
    mayaQuery.error ??
    (isTronEnabled
      ? (tronResourcesQuery.error ?? tronPricesQuery.errors[0])
      : null) ??
    null

  return {
    isPending,
    data,
    error,
  }
}

/**
 * DeFi portfolio total, resolved progressively. `data` sums the chains (and the
 * Circle USDC balance) that have already landed, so the header shows a running
 * total instead of blocking on the slowest chain. `isUpdating` stays true while
 * any chain or the Circle balance is still pending so the UI can render an
 * "updating" affordance alongside the partial number.
 */
export const useDefiPortfolioBalance = () => {
  const portfolios = useDefiChainPortfolios()
  const isCircleIncluded = useIsCircleIncluded()
  const circleFiatBalanceQuery = useCircleAccountUsdcFiatBalanceQuery()

  const resolvedChains = portfolios.data.filter(
    portfolio => !portfolio.isLoading
  )
  const chainTotal = sum(resolvedChains.map(portfolio => portfolio.totalFiat))

  const isCirclePending = isCircleIncluded && circleFiatBalanceQuery.isPending
  const isCircleResolved = isCircleIncluded && !circleFiatBalanceQuery.isPending
  const circleTotal = isCircleResolved ? (circleFiatBalanceQuery.data ?? 0) : 0

  const resolvedCount = resolvedChains.length + (isCircleResolved ? 1 : 0)
  const isUpdating = portfolios.isPending || isCirclePending

  return {
    data: resolvedCount > 0 ? chainTotal + circleTotal : undefined,
    isPending: resolvedCount === 0 && isUpdating,
    isUpdating,
    error: portfolios.error,
  }
}
