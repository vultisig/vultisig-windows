import { describe, expect, it } from 'vitest'

import { toChainAmount } from './toChainAmount'

describe('toChainAmount', () => {
  it('should convert basic decimal amounts correctly', () => {
    expect(toChainAmount(8.8852, 6)).toBe(8885200n)
  })

  it('should handle high-precision decimals', () => {
    expect(toChainAmount(28.57142857142857, 18)).toBe(28571428571428570000n)
  })

  it('should convert common problematic decimals', () => {
    const testCases = [
      { amount: 0.1, decimals: 1, expected: 1n },
      { amount: 0.2, decimals: 1, expected: 2n },
      { amount: 0.3, decimals: 1, expected: 3n },
      { amount: 1.1, decimals: 1, expected: 11n },
      { amount: 2.3, decimals: 1, expected: 23n },
    ]

    for (const { amount, decimals, expected } of testCases) {
      expect(toChainAmount(amount, decimals)).toBe(expected)
    }
  })

  it('should handle fiat-to-crypto conversions with price division', () => {
    // $50 / $45,000 BTC price = 0.00111111... BTC
    const cryptoAmount = 50 / 45000
    const result = toChainAmount(cryptoAmount, 8)

    expect(result).toBe(111111n)
  })

  it('should handle edge cases with extreme price ratios', () => {
    const testCases = [
      { fiat: 100, price: 3.5, decimals: 18 },
      { fiat: 50, price: 1.05, decimals: 6 },
      { fiat: 1000, price: 0.0001, decimals: 8 },
    ]

    for (const { fiat, price, decimals } of testCases) {
      const cryptoAmount = fiat / price
      const result = toChainAmount(cryptoAmount, decimals)

      expect(result).toBeGreaterThan(0n)
    }
  })
})
