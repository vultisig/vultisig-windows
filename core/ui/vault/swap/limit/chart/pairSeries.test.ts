import { MarketChartPoint } from '@core/ui/chain/coin/price/market/marketChart'
import { describe, expect, it } from 'vitest'

import { buildLimitPairSeries } from './pairSeries'

type MakeLegInput = {
  start?: number
  end?: number
  count?: number
  prices?: number[]
  price?: number
}

const makeLeg = ({
  start = 0,
  end = 100_000,
  count = 20,
  prices,
  price = 100,
}: MakeLegInput = {}): MarketChartPoint[] =>
  Array.from({ length: count }, (_, index) => ({
    timestamp: start + ((end - start) * index) / (count - 1),
    price: prices ? prices[index] : price,
  }))

describe('buildLimitPairSeries', () => {
  it('divides the legs into buy units per sell unit', () => {
    const series = buildLimitPairSeries({
      sell: makeLeg({ price: 3000 }),
      buy: makeLeg({ price: 100_000 }),
      count: 10,
    })

    expect(series).toHaveLength(10)
    series?.forEach(({ price }) => expect(price).toBeCloseTo(0.03, 10))
  })

  it('samples both legs onto one shared grid spanning the overlap', () => {
    const series = buildLimitPairSeries({
      sell: makeLeg({ start: 1000, end: 100_000, count: 12, price: 200 }),
      buy: makeLeg({ start: 0, end: 100_000, count: 40, price: 50 }),
      count: 5,
    })

    expect(series?.map(({ timestamp }) => timestamp)).toEqual([
      1000, 25_750, 50_500, 75_250, 100_000,
    ])
  })

  it('interpolates a moving leg rather than snapping to its samples', () => {
    const series = buildLimitPairSeries({
      sell: makeLeg({
        count: 11,
        prices: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110],
      }),
      buy: makeLeg({ count: 11, price: 10 }),
      count: 3,
    })

    expect(series?.map(({ price }) => price)).toEqual([1, 6, 11])
  })

  it('refuses a leg with too few samples', () => {
    expect(
      buildLimitPairSeries({
        sell: makeLeg({ count: 9 }),
        buy: makeLeg(),
      })
    ).toBeNull()
  })

  it('refuses a leg carrying a non-positive sample', () => {
    const sell = makeLeg()
    sell[4] = { ...sell[4], price: 0 }

    expect(buildLimitPairSeries({ sell, buy: makeLeg() })).toBeNull()
  })

  it('refuses a leg carrying a non-finite sample', () => {
    const buy = makeLeg()
    buy[7] = { ...buy[7], price: Number.NaN }

    expect(buildLimitPairSeries({ sell: makeLeg(), buy })).toBeNull()
  })

  it('refuses legs whose windows barely overlap', () => {
    expect(
      buildLimitPairSeries({
        sell: makeLeg({ start: 0, end: 100_000 }),
        buy: makeLeg({ start: 50_000, end: 150_000 }),
      })
    ).toBeNull()
  })

  it('refuses a fresh leg drawn over a stale one', () => {
    expect(
      buildLimitPairSeries({
        sell: makeLeg({ start: 0, end: 100_000 }),
        buy: makeLeg({ start: 0, end: 60_000 }),
      })
    ).toBeNull()
  })

  it('accepts a closing skew inside the tolerance', () => {
    expect(
      buildLimitPairSeries({
        sell: makeLeg({ start: 0, end: 100_000 }),
        buy: makeLeg({ start: 0, end: 96_000 }),
        count: 4,
      })
    ).not.toBeNull()
  })

  it('refuses a zero-width window', () => {
    expect(
      buildLimitPairSeries({
        sell: makeLeg({ start: 5, end: 5 }),
        buy: makeLeg({ start: 5, end: 5 }),
      })
    ).toBeNull()
  })
})
