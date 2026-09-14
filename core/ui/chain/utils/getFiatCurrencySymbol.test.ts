import { describe, expect, it } from 'vitest'

import { getFiatCurrencySymbol } from './getFiatCurrencySymbol'

describe('getFiatCurrencySymbol', () => {
  it('matches the prefix formatAmount prints', () => {
    expect(getFiatCurrencySymbol('usd')).toBe('$')
    expect(getFiatCurrencySymbol('eur')).toBe('€')
    expect(getFiatCurrencySymbol('gbp')).toBe('£')
  })
})
