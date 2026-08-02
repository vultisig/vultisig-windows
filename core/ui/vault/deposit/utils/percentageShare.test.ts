import { describe, expect, it } from 'vitest'

import { getPercentageShareAmount } from './percentageShare'

describe('getPercentageShareAmount', () => {
  it('is exact for balances above 2^53 base units', () => {
    // 2^53 + 1 — the first integer a float64 cannot represent
    expect(
      getPercentageShareAmount({
        balanceUnits: 9007199254740993n,
        percentage: 100,
        decimals: 8,
      })
    ).toBe('90071992.54740993')
  })

  it('keeps every digit of an 18-decimal share', () => {
    expect(
      getPercentageShareAmount({
        balanceUnits: 5123456789012345678n,
        percentage: 100,
        decimals: 18,
      })
    ).toBe('5.123456789012345678')
  })

  it('floors partial shares to whole base units', () => {
    // 25% of (2^53 + 1) units floors to 2251799813685248 units
    expect(
      getPercentageShareAmount({
        balanceUnits: 9007199254740993n,
        percentage: 25,
        decimals: 8,
      })
    ).toBe('22517998.13685248')
  })

  it('computes ordinary shares', () => {
    expect(
      getPercentageShareAmount({
        balanceUnits: 100000000n,
        percentage: 50,
        decimals: 8,
      })
    ).toBe('0.5')
  })
})
