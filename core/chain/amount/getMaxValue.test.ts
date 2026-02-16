import { describe, expect, it } from 'vitest'

import { getMaxValue } from './getMaxValue'

describe('getMaxValue', () => {
  it('returns balance minus fee when balance >= fee', () => {
    expect(getMaxValue(100n, 10n)).toBe(90n)
    expect(getMaxValue(1000000000000000000n, 21000n)).toBe(999999999999979000n)
  })

  it('returns 0n when fee > balance', () => {
    expect(getMaxValue(10n, 100n)).toBe(0n)
    expect(getMaxValue(0n, 1n)).toBe(0n)
  })

  it('returns 0n when balance is zero', () => {
    expect(getMaxValue(0n, 0n)).toBe(0n)
    expect(getMaxValue(0n, 10n)).toBe(0n)
  })

  it('returns balance when fee is zero', () => {
    expect(getMaxValue(100n, 0n)).toBe(100n)
  })
})
