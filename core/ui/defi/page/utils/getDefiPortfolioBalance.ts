import { sum } from '@vultisig/lib-utils/array/sum'

type GetDefiPortfolioBalanceInput = {
  portfolios: { totalFiat: number; isLoading: boolean }[]
  arePortfoliosPending: boolean
  isCircleIncluded: boolean
  circleFiatBalance: number | undefined
  isCirclePending: boolean
}

/**
 * Resolves the DeFi portfolio total progressively. `data` sums the sources
 * (chains and the Circle USDC balance) that have already landed, so the header
 * shows a running total instead of blocking on the slowest one. With no
 * tracked sources at all (no enabled chains, Circle excluded) the total is a
 * settled zero rather than an absent value — nothing is pending, so `data` is
 * `0` and never `undefined`.
 */
export const getDefiPortfolioBalance = ({
  portfolios,
  arePortfoliosPending,
  isCircleIncluded,
  circleFiatBalance,
  isCirclePending,
}: GetDefiPortfolioBalanceInput) => {
  const resolvedChains = portfolios.filter(portfolio => !portfolio.isLoading)
  const chainTotal = sum(resolvedChains.map(portfolio => portfolio.totalFiat))

  // Count Circle only on success — a failed query is no longer pending but its
  // data is undefined, so treating "not pending" as resolved would silently
  // mask the failure as a zero contribution.
  const isCircleResolved = isCircleIncluded && circleFiatBalance !== undefined
  const circleTotal = isCircleResolved ? circleFiatBalance : 0

  const resolvedCount = resolvedChains.length + (isCircleResolved ? 1 : 0)
  const isUpdating =
    arePortfoliosPending || (isCircleIncluded && isCirclePending)
  const hasTrackedSources = portfolios.length > 0 || isCircleIncluded

  return {
    data:
      resolvedCount > 0 || !hasTrackedSources
        ? chainTotal + circleTotal
        : undefined,
    isPending: resolvedCount === 0 && isUpdating,
    isUpdating,
  }
}
