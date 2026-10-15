import { describe, expect, it } from 'vitest'

import { fromChainAmountNumber } from './fromChainAmountNumber'

describe('fromChainAmountNumber', () => {
  it('keeps 0.1 NEAR round at 24 decimals', () => {
    expect(fromChainAmountNumber({ amount: 10n ** 23n, decimals: 24 })).toBe(
      0.1
    )
  })

  it('converts a low-decimal amount', () => {
    expect(fromChainAmountNumber({ amount: 150_000_000n, decimals: 8 })).toBe(
      1.5
    )
  })

  it('converts zero', () => {
    expect(fromChainAmountNumber({ amount: 0n, decimals: 18 })).toBe(0)
  })
})
