import { describe, expect, it } from 'vitest'

import {
  getLimitPriceWarning,
  getPresetPrice,
  parseLimitPrice,
  quantizeTargetPrice,
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

  // A comma is ambiguous between a decimal (`0,04`) and a thousands separator
  // (`65,800` -> would silently parse to 65.8, a 1000x error in the signed
  // memo), so reject any comma and let the user retype with a dot.
  it.each(['0,04', '65,800', '1,000', '65,800.13', '1,000.5'])(
    'rejects the comma input %j rather than guessing',
    input => {
      expect(parseLimitPrice(input)).toBeNull()
    }
  )

  it.each(['', '  ', 'abc', '1.2.3', '-5', '0', '1e5'])(
    'rejects %j rather than guessing',
    input => {
      expect(parseLimitPrice(input)).toBeNull()
    }
  )
})

describe('quantizeTargetPrice', () => {
  // The memo encodes at most 8 fractional digits; a rate from a division has
  // more, and the SDK builder rejects the excess.
  it('rounds a many-digit rate to 8 fractional digits', () => {
    const rate = 1 / 0.42727971 // 2.340387284011216
    const quantized = quantizeTargetPrice(rate)

    expect(quantized).toBe(2.34038728)
    expect(
      (quantized.toString().split('.')[1] ?? '').length
    ).toBeLessThanOrEqual(8)
  })

  it('keeps a small rate within 8 fractional digits', () => {
    const quantized = quantizeTargetPrice(1 / 66000)

    expect(quantized).toBe(0.00001515)
    expect(
      (quantized.toString().split('.')[1] ?? '').length
    ).toBeLessThanOrEqual(8)
  })

  it('leaves an already-short rate unchanged', () => {
    expect(quantizeTargetPrice(2.5)).toBe(2.5)
  })
})
