import { describe, expect, it } from 'vitest'

import { rescaleChainAmount } from './rescaleChainAmount'

describe('rescaleChainAmount', () => {
  it('keeps the number when moving to more decimals', () => {
    expect(
      rescaleChainAmount({
        amount: 100_000_000n,
        fromDecimals: 6,
        toDecimals: 18,
      })
    ).toBe(100n * 10n ** 18n)
  })

  it('truncates digits the coin with fewer decimals cannot hold', () => {
    expect(
      rescaleChainAmount({
        amount: 3_758_200_000_000_000n,
        fromDecimals: 18,
        toDecimals: 6,
      })
    ).toBe(3_758n)
  })

  it('leaves the amount alone when the decimals match', () => {
    expect(
      rescaleChainAmount({ amount: 42n, fromDecimals: 8, toDecimals: 8 })
    ).toBe(42n)
  })
})
