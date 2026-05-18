import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useCosmosDelegationsQuery } from '@core/ui/chain/cosmos/staking/queries/useCosmosDelegationsQuery'
import { useIsCircleIncluded } from '@core/ui/storage/circleVisibility'
import { useTronAccountResourcesQuery } from '@core/ui/vault/chain/tron/useTronAccountResourcesQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Chain } from '@vultisig/core-chain/Chain'
import { sunToTrx } from '@vultisig/core-chain/chains/tron/resources'
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

  // Terra-family native staking — we surface a portfolio entry whenever the
  // chain is enabled. Fiat is left at 0 until a price feed is wired; the
  // chain card still renders so users can navigate into the staking surface.
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
        totalFiat: 0,
        positionsWithBalanceCount: terraDelegationsQuery.data?.length ?? 0,
        isLoading: terraDelegationsQuery.isPending,
      })
    }

    if (enabledChains.includes(Chain.TerraClassic)) {
      portfolios.push({
        chain: Chain.TerraClassic,
        totalFiat: 0,
        positionsWithBalanceCount:
          terraClassicDelegationsQuery.data?.length ?? 0,
        isLoading: terraClassicDelegationsQuery.isPending,
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
  ])

  const isPending =
    (enabledChains.includes(Chain.THORChain) && thorchainQuery.isPending) ||
    (enabledChains.includes(Chain.MayaChain) && mayaQuery.isPending) ||
    (enabledChains.includes(Chain.Tron) &&
      (tronResourcesQuery.isPending || tronPricesQuery.isPending)) ||
    (enabledChains.includes(Chain.Terra) && terraDelegationsQuery.isPending) ||
    (enabledChains.includes(Chain.TerraClassic) &&
      terraClassicDelegationsQuery.isPending)

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

export const useDefiPortfolioBalance = () => {
  const portfolios = useDefiChainPortfolios()
  const isCircleIncluded = useIsCircleIncluded()
  const circleFiatBalanceQuery = useCircleAccountUsdcFiatBalanceQuery()

  const total = useMemo(() => {
    if (portfolios.isPending || circleFiatBalanceQuery.isPending) {
      return undefined
    }

    const chainTotal = sum(
      portfolios.data.map(portfolio => portfolio.totalFiat)
    )

    const circleTotal = isCircleIncluded
      ? (circleFiatBalanceQuery.data ?? 0)
      : 0

    return chainTotal + circleTotal
  }, [
    portfolios.data,
    portfolios.isPending,
    circleFiatBalanceQuery.data,
    circleFiatBalanceQuery.isPending,
    isCircleIncluded,
  ])

  return {
    ...portfolios,
    data: total,
    error: portfolios.error,
  }
}
