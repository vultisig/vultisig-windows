import { describe, expect, it } from 'vitest'

import { formatDiscountPercentOfBaseFee } from './discountPercent'

describe('formatDiscountPercentOfBaseFee', () => {
  it('formats common tier values using base fee percentage', () => {
    expect(formatDiscountPercentOfBaseFee(5)).toBe('10%')
    expect(formatDiscountPercentOfBaseFee(10)).toBe('20%')
    expect(formatDiscountPercentOfBaseFee(20)).toBe('40%')
    expect(formatDiscountPercentOfBaseFee(50)).toBe('100%')
  })

  it('handles non-positive values safely', () => {
    expect(formatDiscountPercentOfBaseFee(0)).toBe('0%')
    expect(formatDiscountPercentOfBaseFee(-10)).toBe('0%')
  })

  it('rounds to max 2 decimals and trims trailing zeros', () => {
    expect(formatDiscountPercentOfBaseFee(1)).toBe('2%')
    expect(formatDiscountPercentOfBaseFee(3)).toBe('6%')
    expect(formatDiscountPercentOfBaseFee(7)).toBe('14%')
  })
})
