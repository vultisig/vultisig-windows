import { describe, expect, it } from 'vitest'

import { getDefiPortfolioBalance } from './getDefiPortfolioBalance'

const noCircle = {
  isCircleIncluded: false,
  circleFiatBalance: undefined,
  isCirclePending: false,
}

describe('getDefiPortfolioBalance', () => {
  it('resolves to zero when no chains are enabled and Circle is excluded', () => {
    const result = getDefiPortfolioBalance({
      portfolios: [],
      arePortfoliosPending: false,
      ...noCircle,
    })

    expect(result).toEqual({ data: 0, isPending: false, isUpdating: false })
  })

  it('is pending while every enabled chain is still loading', () => {
    const result = getDefiPortfolioBalance({
      portfolios: [{ totalFiat: 0, isLoading: true }],
      arePortfoliosPending: true,
      ...noCircle,
    })

    expect(result).toEqual({
      data: undefined,
      isPending: true,
      isUpdating: true,
    })
  })

  it('reports a running total while some chains are still loading', () => {
    const result = getDefiPortfolioBalance({
      portfolios: [
        { totalFiat: 100, isLoading: false },
        { totalFiat: 50, isLoading: true },
      ],
      arePortfoliosPending: true,
      ...noCircle,
    })

    expect(result).toEqual({ data: 100, isPending: false, isUpdating: true })
  })

  it('sums all chains once everything has resolved', () => {
    const result = getDefiPortfolioBalance({
      portfolios: [
        { totalFiat: 100, isLoading: false },
        { totalFiat: 50, isLoading: false },
      ],
      arePortfoliosPending: false,
      ...noCircle,
    })

    expect(result).toEqual({ data: 150, isPending: false, isUpdating: false })
  })

  it('is pending while Circle is the only source and still loading', () => {
    const result = getDefiPortfolioBalance({
      portfolios: [],
      arePortfoliosPending: false,
      isCircleIncluded: true,
      circleFiatBalance: undefined,
      isCirclePending: true,
    })

    expect(result).toEqual({
      data: undefined,
      isPending: true,
      isUpdating: true,
    })
  })

  it('adds the Circle balance to the chain total once resolved', () => {
    const result = getDefiPortfolioBalance({
      portfolios: [{ totalFiat: 100, isLoading: false }],
      arePortfoliosPending: false,
      isCircleIncluded: true,
      circleFiatBalance: 25,
      isCirclePending: false,
    })

    expect(result).toEqual({ data: 125, isPending: false, isUpdating: false })
  })

  it('does not mask a failed Circle query as a resolved zero', () => {
    const result = getDefiPortfolioBalance({
      portfolios: [],
      arePortfoliosPending: false,
      isCircleIncluded: true,
      circleFiatBalance: undefined,
      isCirclePending: false,
    })

    expect(result).toEqual({
      data: undefined,
      isPending: false,
      isUpdating: false,
    })
  })

  it('ignores a pending Circle query when Circle is excluded', () => {
    const result = getDefiPortfolioBalance({
      portfolios: [],
      arePortfoliosPending: false,
      isCircleIncluded: false,
      circleFiatBalance: undefined,
      isCirclePending: true,
    })

    expect(result).toEqual({ data: 0, isPending: false, isUpdating: false })
  })
})
