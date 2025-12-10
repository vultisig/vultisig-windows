import { Chain } from '@core/chain/Chain'
import { sum } from '@lib/utils/array/sum'
import { useMemo } from 'react'

import { useDefiChains } from '../../../storage/defiChains'
import { useDefiPositions } from '../../../storage/defiPositions'
import { useThorchainDefiPositionsQuery } from '../../chain/queries/useThorchainDefiPositionsQuery'
import { aggregateDefiPositions } from '../../chain/services/defiPositionAggregator'

export type DefiChainPortfolio = {
  chain: Chain
  totalFiat: number
}

export const useDefiChainPortfolios = () => {
  const enabledChains = useDefiChains()
  const thorchainSelectedPositions = useDefiPositions(Chain.THORChain)
  const thorchainQuery = useThorchainDefiPositionsQuery()

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
      })
    }

    // Maya and LPs can be added here once available

    return portfolios
  }, [enabledChains, thorchainQuery.data, thorchainSelectedPositions])

  const isPending = thorchainQuery.isPending

  const error = thorchainQuery.error ?? null

  return {
    isPending,
    data,
    error,
  }
}

export const useDefiPortfolioBalance = () => {
  const portfolios = useDefiChainPortfolios()

  const total = useMemo(
    () =>
      portfolios.isPending
        ? undefined
        : sum(portfolios.data.map(portfolio => portfolio.totalFiat)),
    [portfolios.data, portfolios.isPending]
  )

  return {
    ...portfolios,
    data: total,
    error: portfolios.error,
  }
}
