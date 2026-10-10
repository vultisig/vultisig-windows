import { describe, expect, it } from 'vitest'

import { formatPermitAmount } from './formatPermitAmount'

describe('formatPermitAmount', () => {
  it('formats a whole amount without a fractional part', () => {
    expect(formatPermitAmount({ amount: 1_000_000n, decimals: 6 })).toBe('1')
  })

  it('keeps fractional digits', () => {
    expect(formatPermitAmount({ amount: 1_234_567n, decimals: 6 })).toBe(
      '1.234567'
    )
  })

  it('keeps the smallest unit instead of rounding it to zero', () => {
    expect(formatPermitAmount({ amount: 1n, decimals: 18 })).toBe(
      '0.000000000000000001'
    )
  })

  it('keeps every digit of a large amount', () => {
    expect(
      formatPermitAmount({ amount: 10n ** 40n + 123_456n, decimals: 18 })
    ).toBe('10000000000000000000000.000000000000123456')
  })

  it('formats zero', () => {
    expect(formatPermitAmount({ amount: 0n, decimals: 6 })).toBe('0')
  })
})
