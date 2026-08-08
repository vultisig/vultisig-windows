import { toChainAmount } from '@vultisig/core-chain/amount/toChainAmount'
import { describe, expect, it } from 'vitest'

import { getSwapKeysignAmount } from './query'

describe('getSwapKeysignAmount', () => {
  it('keeps every digit of a full-precision 18-decimal amount', () => {
    expect(
      getSwapKeysignAmount({ fromAmount: 6123456789012345678n, decimals: 18 })
    ).toBe('6.123456789012345678')
  })

  it('does not round-trip the amount through float64', () => {
    const fromAmount = 6123456789012345678n

    // Number(6123456789012345678n) is 6123456789012345856 — a float64 path
    // would corrupt the last digits (#4391)
    expect(BigInt(Number(fromAmount))).not.toBe(fromAmount)
    expect(getSwapKeysignAmount({ fromAmount, decimals: 18 })).toBe(
      '6.123456789012345678'
    )
  })

  it.each([
    [6123456789012345678n, 18],
    [100123456n, 6],
    [1n, 18],
    [123456789012345678901234567890n, 18],
    [0n, 8],
  ])(
    'round-trips %s (decimals %s) exactly through toChainAmount',
    (fromAmount, decimals) => {
      const amount = getSwapKeysignAmount({ fromAmount, decimals })

      expect(toChainAmount(amount, decimals)).toBe(fromAmount)
    }
  )
})
