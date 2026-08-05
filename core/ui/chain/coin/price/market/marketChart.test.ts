import { describe, expect, it } from 'vitest'

import {
  getMarketChartChangeFraction,
  getMarketChartPriceDomain,
  MarketChartPoint,
  marketChartPointCount,
  minimumUsableMarketChartPoints,
  parseMarketChartPoints,
  resampleMarketChart,
} from './marketChart'

const makeSeries = (prices: number[], stepMs = 60_000): MarketChartPoint[] =>
  prices.map((price, index) => ({ timestamp: index * stepMs, price }))

describe('parseMarketChartPoints', () => {
  it('decodes [timestamp, price] pairs', () => {
    expect(
      parseMarketChartPoints([
        [1000, 1.5],
        [2000, 2.5],
      ])
    ).toEqual([
      { timestamp: 1000, price: 1.5 },
      { timestamp: 2000, price: 2.5 },
    ])
  })

  it('drops malformed pairs instead of failing the series', () => {
    expect(
      parseMarketChartPoints([
        [1000],
        [2000, null],
        [null, 3],
        [Number.NaN, 4],
        [3000, Number.POSITIVE_INFINITY],
        [4000, 0],
        [5000, -1],
        [6000, 2],
      ])
    ).toEqual([{ timestamp: 6000, price: 2 }])
  })

  it('sorts the series ascending by timestamp', () => {
    expect(
      parseMarketChartPoints([
        [3000, 3],
        [1000, 1],
        [2000, 2],
      ])
    ).toEqual([
      { timestamp: 1000, price: 1 },
      { timestamp: 2000, price: 2 },
      { timestamp: 3000, price: 3 },
    ])
  })

  it('collapses duplicate timestamps to the last occurrence', () => {
    expect(
      parseMarketChartPoints([
        [1000, 1],
        [1000, 9],
        [2000, 2],
      ])
    ).toEqual([
      { timestamp: 1000, price: 9 },
      { timestamp: 2000, price: 2 },
    ])
  })
})

describe('resampleMarketChart', () => {
  it('downsamples a long series to exactly the requested count', () => {
    const points = makeSeries(
      Array.from({ length: 5000 }, (_, index) => 100 + Math.sin(index))
    )

    const resampled = resampleMarketChart({ points })

    expect(resampled).toHaveLength(marketChartPointCount)
  })

  it('upsamples a short series to the requested count', () => {
    const points = makeSeries(Array.from({ length: 20 }, (_, i) => i))

    const resampled = resampleMarketChart({ points, count: 50 })

    expect(resampled).toHaveLength(50)
  })

  it('carries the first and last source samples over untouched', () => {
    const points = makeSeries([5, 8, 2, 9, 4, 7, 1, 6, 3, 10])

    const resampled = resampleMarketChart({ points, count: 30 })

    expect(resampled[0]).toEqual(points[0])
    expect(resampled[resampled.length - 1]).toEqual(points[points.length - 1])
  })

  it('produces an evenly-spaced-in-time grid', () => {
    const points = makeSeries(Array.from({ length: 100 }, (_, i) => i))

    const resampled = resampleMarketChart({ points, count: 10 })

    const steps = resampled
      .slice(1)
      .map((point, index) => point.timestamp - resampled[index].timestamp)

    steps.forEach(step => expect(step).toBeCloseTo(steps[0], 6))
  })

  it('interpolates linearly between the bracketing source samples', () => {
    const points: MarketChartPoint[] = [
      { timestamp: 0, price: 0 },
      { timestamp: 100, price: 100 },
    ]

    const resampled = resampleMarketChart({ points, count: 5 })

    expect(resampled.map(({ price }) => price)).toEqual([0, 25, 50, 75, 100])
  })

  it('returns degenerate series unchanged', () => {
    const single = makeSeries([1])
    expect(resampleMarketChart({ points: single })).toEqual(single)

    const zeroSpan: MarketChartPoint[] = [
      { timestamp: 1000, price: 1 },
      { timestamp: 1000, price: 2 },
    ]
    expect(resampleMarketChart({ points: zeroSpan })).toEqual(zeroSpan)
  })

  it('keeps a usability floor below the render count', () => {
    expect(minimumUsableMarketChartPoints).toBeLessThan(marketChartPointCount)
  })
})

describe('getMarketChartPriceDomain', () => {
  it('pads the price extent with headroom', () => {
    const [min, max] = getMarketChartPriceDomain(makeSeries([100, 200]))

    expect(min).toBeCloseTo(92)
    expect(max).toBeCloseTo(208)
  })

  it('pads a flat series so the domain has height', () => {
    const [min, max] = getMarketChartPriceDomain(makeSeries([100, 100]))

    expect(min).toBeCloseTo(95)
    expect(max).toBeCloseTo(105)
  })

  it('falls back to a unit pad when the flat price is zero-adjacent', () => {
    const [min, max] = getMarketChartPriceDomain([])

    expect(max).toBeGreaterThan(min)
  })
})

describe('getMarketChartChangeFraction', () => {
  it('returns the signed relative change between endpoints', () => {
    expect(
      getMarketChartChangeFraction(makeSeries([100, 150, 105]))
    ).toBeCloseTo(0.05)
    expect(getMarketChartChangeFraction(makeSeries([100, 90]))).toBeCloseTo(
      -0.1
    )
  })

  it('returns null for series without two endpoints', () => {
    expect(getMarketChartChangeFraction([])).toBeNull()
    expect(getMarketChartChangeFraction(makeSeries([1]))).toBeNull()
  })
})
