import { describe, expect, it } from 'vitest'

import { getLimitOrderUnitPriceLabel } from './limitOrderUnitPrice'

const ethRune = { sellTicker: 'ETH', buyTicker: 'RUNE' }

describe('getLimitOrderUnitPriceLabel', () => {
  // Regression: formatAmount's default 3-digit precision rendered this exact
  // order as "1 RUNE = 0 ETH" on the co-signer's verify screen.
  it('keeps enough precision for a small rate', () => {
    expect(
      getLimitOrderUnitPriceLabel({
        sellAmount: 0.0002,
        buyAmount: 0.85041245,
        ...ethRune,
      })
    ).toBe('1 RUNE = 0.00023518 ETH')
  })

  it('reads as buy-per-sell, matching the initiator', () => {
    expect(
      getLimitOrderUnitPriceLabel({
        sellAmount: 1000,
        buyAmount: 0.125,
        sellTicker: 'RUNE',
        buyTicker: 'BTC',
      })
    ).toBe('1 BTC = 8,000 RUNE')
  })

  // "0" would read as a real price rather than as "too small to show".
  it.each([
    ['a zero buy amount', 0.0002, 0],
    ['a zero sell amount', 0, 1],
    ['a rate that rounds away even at full precision', 1e-12, 1],
  ])('returns null for %s', (_label, sellAmount, buyAmount) => {
    expect(
      getLimitOrderUnitPriceLabel({ sellAmount, buyAmount, ...ethRune })
    ).toBeNull()
  })
})
