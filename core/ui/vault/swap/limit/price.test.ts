import { describe, expect, it } from 'vitest'

import {
  getLimitPriceWarning,
  getPercentFromMarket,
  getPresetPrice,
  parseLimitPrice,
} from './price'

describe('getPresetPrice', () => {
  it.each([
    [0, 100],
    [1, 101],
    [5, 105],
    [10, 110],
  ] as const)('prices the +%s%% preset at %s', (preset, expected) => {
    expect(getPresetPrice({ marketPrice: 100, preset })).toBeCloseTo(expected)
  })

  it('scales a fractional market price', () => {
    expect(getPresetPrice({ marketPrice: 0.04, preset: 5 })).toBeCloseTo(0.042)
  })
})

describe('getPercentFromMarket', () => {
  it.each([
    [110, 10],
    [100, 0],
    [90, -10],
  ])('reports %s as %s%% from market', (price, expected) => {
    expect(getPercentFromMarket({ price, marketPrice: 100 })).toBeCloseTo(
      expected
    )
  })

  // Dividing by a zero market would yield Infinity and render as garbage.
  it.each([0, -1])('returns null for a %s market price', marketPrice => {
    expect(getPercentFromMarket({ price: 100, marketPrice })).toBeNull()
  })
})

describe('getLimitPriceWarning', () => {
  it('warns when the price would fill more or less immediately', () => {
    expect(getLimitPriceWarning({ price: 95, marketPrice: 100 })).toBe(
      'atOrBelowMarket'
    )
  })

  it('treats exactly market as at-or-below', () => {
    expect(getLimitPriceWarning({ price: 100, marketPrice: 100 })).toBe(
      'atOrBelowMarket'
    )
  })

  it('warns when the price is unlikely to fill before expiry', () => {
    expect(getLimitPriceWarning({ price: 121, marketPrice: 100 })).toBe(
      'farAboveMarket'
    )
  })

  it('stays quiet in the normal band above market', () => {
    expect(
      getLimitPriceWarning({ price: 105, marketPrice: 100 })
    ).toBeUndefined()
  })

  it('sits exactly on the far-above threshold without warning', () => {
    expect(
      getLimitPriceWarning({ price: 120, marketPrice: 100 })
    ).toBeUndefined()
  })

  it.each([undefined, 0])(
    'has nothing to compare against with a %s market price',
    marketPrice => {
      expect(getLimitPriceWarning({ price: 105, marketPrice })).toBeUndefined()
    }
  )
})

describe('parseLimitPrice', () => {
  it.each([
    ['0.04', 0.04],
    ['16', 16],
    ['  2.5  ', 2.5],
    ['.5', 0.5],
  ])('parses %j as %s', (input, expected) => {
    expect(parseLimitPrice(input)).toBe(expected)
  })

  // A locale that types `0,04` must not be read as 0 or 4 -- that is a 100x
  // pricing error in a value that ends up in a signed memo.
  it('accepts a comma decimal separator', () => {
    expect(parseLimitPrice('0,04')).toBe(0.04)
  })

  it.each(['', '  ', 'abc', '1.2.3', '-5', '0', '1e5', '1,000.5'])(
    'rejects %j rather than guessing',
    input => {
      expect(parseLimitPrice(input)).toBeNull()
    }
  )
})
