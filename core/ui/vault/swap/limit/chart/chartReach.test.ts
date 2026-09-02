import { MarketChartPoint } from '@core/ui/chain/coin/price/market/marketChart'
import { describe, expect, it } from 'vitest'

import { getLimitChartReach } from './chartReach'

const makePoints = (prices: number[]): MarketChartPoint[] =>
  prices.map((price, index) => ({ timestamp: index * 1000, price }))

describe('getLimitChartReach', () => {
  it('calls a target at or below market a fill on arrival', () => {
    expect(
      getLimitChartReach({
        points: makePoints([1, 2, 3]),
        targetPrice: 100,
        marketPrice: 100,
      })
    ).toEqual({ atOrBelowMarket: true })
  })

  it('reports the highest the pair got when the target was never reached', () => {
    expect(
      getLimitChartReach({
        points: makePoints([100, 118, 104]),
        targetPrice: 130,
        marketPrice: 104,
      })
    ).toEqual({ notReached: 118 })
  })

  it('takes the last crossing, not the first', () => {
    const reach = getLimitChartReach({
      points: makePoints([150, 90, 150, 90]),
      targetPrice: 120,
      marketPrice: 90,
    })

    expect(reach).toEqual({ lastTraded: 2500 })
  })

  it('interpolates the crossing instant between samples', () => {
    const reach = getLimitChartReach({
      points: makePoints([200, 100]),
      targetPrice: 175,
      marketPrice: 100,
    })

    expect(reach).toEqual({ lastTraded: 250 })
  })

  it('reports the newest sample when the series is still at the target', () => {
    const reach = getLimitChartReach({
      points: makePoints([100, 110, 130]),
      targetPrice: 125,
      marketPrice: 120,
    })

    expect(reach).toEqual({ lastTraded: 2000 })
  })

  it('has nothing to say without a series', () => {
    expect(
      getLimitChartReach({ points: [], targetPrice: 1, marketPrice: 1 })
    ).toBeNull()
  })

  it('has nothing to say without a target', () => {
    expect(
      getLimitChartReach({
        points: makePoints([1, 2]),
        targetPrice: 0,
        marketPrice: 1,
      })
    ).toBeNull()
  })
})
