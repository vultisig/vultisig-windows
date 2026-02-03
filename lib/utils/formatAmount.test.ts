import { describe, expect, it } from 'vitest'

import { formatAmount } from './formatAmount'

describe('formatAmount', () => {
  describe('basic formatting', () => {
    it('should format small numbers with default precision', () => {
      expect(formatAmount(123.456)).toBe('123.456')
      expect(formatAmount(1.23456789)).toBe('1.235')
    })

    it('should format with medium precision', () => {
      expect(formatAmount(123.456789, { precision: 'medium' })).toBe('123.457')
    })

    it('should format with high precision', () => {
      expect(formatAmount(123.456789, { precision: 'high' })).toBe('123.456789')
      expect(formatAmount(1.123456789, { precision: 'high' })).toBe(
        '1.12345679'
      )
    })
  })

  describe('million abbreviation', () => {
    it('should format millions with M suffix', () => {
      expect(formatAmount(1500000)).toBe('1.5M')
      expect(formatAmount(2345678)).toBe('2.346M')
    })

    it('should format millions with currency and M suffix', () => {
      const result = formatAmount(1500000, { currency: 'usd' })
      expect(result).toMatch(/\$1\.50?M/)
    })

    it('should format millions with ticker and M suffix', () => {
      expect(formatAmount(1500000, { ticker: 'BTC' })).toBe('1.5M BTC')
    })
  })

  describe('billion abbreviation', () => {
    it('should format billions with B suffix', () => {
      expect(formatAmount(1500000000)).toBe('1.5B')
      expect(formatAmount(2345678900)).toBe('2.346B')
    })

    it('should format billions with currency and B suffix', () => {
      const result = formatAmount(1500000000, { currency: 'usd' })
      expect(result).toMatch(/\$1\.50?B/)
    })

    it('should format billions with ticker and B suffix', () => {
      expect(formatAmount(1500000000, { ticker: 'BTC' })).toBe('1.5B BTC')
    })
  })

  describe('currency formatting', () => {
    it('should format with currency symbol', () => {
      const result = formatAmount(123.45, { currency: 'usd' })
      expect(result).toMatch(/\$123\.45/)
    })

    it('should format currency with uppercase conversion', () => {
      const result = formatAmount(100, { currency: 'eur' })
      expect(result).toContain('100')
    })
  })

  describe('ticker formatting', () => {
    it('should append ticker to amount', () => {
      expect(formatAmount(123.456, { ticker: 'BTC' })).toBe('123.456 BTC')
      expect(formatAmount(0.001, { ticker: 'ETH' })).toBe('0.001 ETH')
    })

    it('should append ticker with high precision', () => {
      expect(formatAmount(123.456789, { ticker: 'BTC' })).toBe('123.456789 BTC')
    })
  })

  describe('edge cases', () => {
    it('should handle zero', () => {
      expect(formatAmount(0)).toBe('0')
    })

    it('should handle very small numbers', () => {
      expect(formatAmount(0.000001, { precision: 'high' })).toBe('0.000001')
      expect(formatAmount(0.001, { precision: 'high' })).toBe('0.001')
    })

    it('should handle exactly 1 million', () => {
      expect(formatAmount(1000000)).toBe('1M')
    })

    it('should handle exactly 1 billion', () => {
      expect(formatAmount(1000000000)).toBe('1B')
    })

    it('should handle numbers just below million threshold', () => {
      expect(formatAmount(999999)).toBe('999,999')
    })

    it('should handle numbers just below billion threshold', () => {
      expect(formatAmount(999999999)).toBe('1,000M')
    })
  })

  describe('abbreviation position fix', () => {
    it('should place M suffix immediately after number, not at end', () => {
      const result = formatAmount(1500000, { currency: 'usd' })
      // Should be $1.5M or $1.50M, not $1.5 USD M or similar
      expect(result).toMatch(/\$1\.50?M/)
      // Ensure M is not separated by spaces or other text
      expect(result).not.toMatch(/\d\s+.*M$/)
    })

    it('should place B suffix immediately after number, not at end', () => {
      const result = formatAmount(1500000000, { currency: 'usd' })
      // Should be $1.5B or $1.50B, not $1.5 USD B or similar
      expect(result).toMatch(/\$1\.50?B/)
      // Ensure B is not separated by spaces or other text
      expect(result).not.toMatch(/\d\s+.*B$/)
    })

    it('should place M before ticker', () => {
      const result = formatAmount(1500000, { ticker: 'BTC' })
      // Should be 1.5M BTC, not 1.5 BTC M
      expect(result).toBe('1.5M BTC')
    })

    it('should place B before ticker', () => {
      const result = formatAmount(1500000000, { ticker: 'ETH' })
      // Should be 1.5B ETH, not 1.5 ETH B
      expect(result).toBe('1.5B ETH')
    })
  })
})
