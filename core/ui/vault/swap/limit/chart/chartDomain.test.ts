import { MarketChartPoint } from '@core/ui/chain/coin/price/market/marketChart'
import { describe, expect, it } from 'vitest'

import {
  getLimitChartDomain,
  getLimitChartFraction,
  getLimitChartPlacement,
  getLimitChartValue,
  limitChartGuidePresets,
} from './chartDomain'

const makePoints = (prices: number[]): MarketChartPoint[] =>
  prices.map((price, index) => ({ timestamp: index * 1000, price }))

describe('getLimitChartDomain', () => {
  it('anchors on the market rate when the series sits inside it', () => {
    const domain = getLimitChartDomain({
      points: makePoints([100, 101, 99]),
      marketPrice: 100,
    })

    const span = 112 - 97

    expect(domain.min).toBeCloseTo(97 - span * 0.06, 8)
    expect(domain.max).toBeCloseTo(112 + span * 0.06, 8)
  })

  it('is widened by a series that runs past the anchors', () => {
    const domain = getLimitChartDomain({
      points: makePoints([80, 130]),
      marketPrice: 100,
    })

    const span = 130 - 80

    expect(domain.min).toBeCloseTo(80 - span * 0.06, 8)
    expect(domain.max).toBeCloseTo(130 + span * 0.06, 8)
  })

  it('keeps the same window whatever the target is, so dragging cannot rescale it', () => {
    const input = { points: makePoints([100, 101]), marketPrice: 100 }

    expect(getLimitChartDomain(input)).toEqual(getLimitChartDomain(input))
  })

  it('pads a flat series with no market rate rather than collapsing', () => {
    const domain = getLimitChartDomain({
      points: makePoints([50, 50]),
      marketPrice: 0,
    })

    expect(domain.max).toBeGreaterThan(domain.min)
  })

  it('falls back to a unit window with nothing to anchor on', () => {
    expect(getLimitChartDomain({ points: [], marketPrice: 0 })).toEqual({
      min: 0,
      max: 1,
    })
  })

  it('guides the two furthest-above-market preset stops', () => {
    expect(limitChartGuidePresets).toEqual([5, 10])
  })
})

describe('getLimitChartFraction', () => {
  const domain = { min: 0, max: 100 }

  it('measures top-down, so the ceiling is zero', () => {
    expect(getLimitChartFraction({ value: 100, domain })).toBe(0)
    expect(getLimitChartFraction({ value: 50, domain })).toBe(0.5)
    expect(getLimitChartFraction({ value: 0, domain })).toBe(1)
  })

  it('leaves an off-scale value unclamped', () => {
    expect(getLimitChartFraction({ value: 150, domain })).toBe(-0.5)
  })

  it('inverts through getLimitChartValue', () => {
    const fraction = getLimitChartFraction({ value: 37, domain })

    expect(getLimitChartValue({ fraction, domain })).toBeCloseTo(37, 10)
  })
})

describe('getLimitChartPlacement', () => {
  const domain = { min: 0, max: 100 }

  it('places an in-window target without flagging it', () => {
    expect(getLimitChartPlacement({ value: 25, domain })).toEqual({
      fraction: 0.75,
      offScale: undefined,
    })
  })

  it('pins a target above the ceiling to the top edge', () => {
    expect(getLimitChartPlacement({ value: 400, domain })).toEqual({
      fraction: 0,
      offScale: 'above',
    })
  })

  it('pins a target below the floor to the bottom edge', () => {
    expect(getLimitChartPlacement({ value: -10, domain })).toEqual({
      fraction: 1,
      offScale: 'below',
    })
  })
})
