import { Chain } from '@core/chain/Chain'
import { sum } from '@lib/utils/array/sum'
import { useMemo } from 'react'

import { useDefiChains } from '../../../storage/defiChains'
import { useDefiPositions } from '../../../storage/defiPositions'
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
  const mayaQuery = useMayaDefiPositionsQuery()

  const data = useMemo<DefiChainPortfolio[]>(() => {
    const portfolios: DefiChainPortfolio[] = []

    if (enabledChains.includes(Chain.THORChain)) {
      const selected = new Set(thorchainSelectedPositions)
      const aggregates = aggregateDefiPositions({
        chain: Chain.THORChain,
        selectedPositionIds: Array.from(selected),
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
      const selected = new Set(mayaSelectedPositions)
      const aggregates = aggregateDefiPositions({
        chain: Chain.MayaChain,
        selectedPositionIds: Array.from(selected),
        maya: mayaQuery.data,
      })

      portfolios.push({
        chain: Chain.MayaChain,
        totalFiat: aggregates.totalFiat,
        positionsWithBalanceCount: aggregates.positionsWithBalanceCount,
        isLoading: mayaQuery.isPending,
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
  ])

  const isPending =
    (enabledChains.includes(Chain.THORChain) && thorchainQuery.isPending) ||
    (enabledChains.includes(Chain.MayaChain) && mayaQuery.isPending)

  const error = thorchainQuery.error ?? mayaQuery.error ?? null

  return {
    isPending,
    data,
    error,
  }
}

export const useDefiPortfolioBalance = () => {
  const portfolios = useDefiChainPortfolios()
  const circleFiatBalanceQuery = useCircleAccountUsdcFiatBalanceQuery()

  const total = useMemo(() => {
    if (portfolios.isPending || circleFiatBalanceQuery.isPending) {
      return undefined
    }

    const chainTotal = sum(
      portfolios.data.map(portfolio => portfolio.totalFiat)
    )

    return chainTotal + (circleFiatBalanceQuery.data ?? 0)
  }, [
    portfolios.data,
    portfolios.isPending,
    circleFiatBalanceQuery.data,
    circleFiatBalanceQuery.isPending,
  ])

  return {
    ...portfolios,
    data: total,
    error: portfolios.error,
  }
}
