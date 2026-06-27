import { describe, expect, it } from 'vitest'

import { qbtcWeightPercentToDecString } from './weight'

describe('qbtcWeightPercentToDecString', () => {
  it('pads fractions to canonical 18-decimal cosmos.Dec form', () => {
    expect(qbtcWeightPercentToDecString(70)).toBe('0.700000000000000000')
    expect(qbtcWeightPercentToDecString(30)).toBe('0.300000000000000000')
    expect(qbtcWeightPercentToDecString(5)).toBe('0.050000000000000000')
    expect(qbtcWeightPercentToDecString(0)).toBe('0.000000000000000000')
    expect(qbtcWeightPercentToDecString(100)).toBe('1.000000000000000000')
  })

  it('rejects out-of-range or non-integer percents', () => {
    expect(() => qbtcWeightPercentToDecString(-1)).toThrow()
    expect(() => qbtcWeightPercentToDecString(101)).toThrow()
    expect(() => qbtcWeightPercentToDecString(33.3)).toThrow()
  })
})
