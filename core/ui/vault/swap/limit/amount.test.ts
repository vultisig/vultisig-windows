import { describe, expect, it } from 'vitest'

import { fromThorchainFixedPoint, toThorchainFixedPoint } from './amount'

describe('toThorchainFixedPoint', () => {
  it('is a no-op for 8-decimal sources', () => {
    expect(toThorchainFixedPoint({ amount: 100_000_000n, decimals: 8 })).toBe(
      100_000_000n
    )
  })

  it('scales an 18-decimal source down to 1e8', () => {
    // 1 ETH -> 1e8, not the 1e18 that would be 1e10x too large.
    expect(toThorchainFixedPoint({ amount: 10n ** 18n, decimals: 18 })).toBe(
      100_000_000n
    )
  })

  it('scales a 6-decimal source up to 1e8', () => {
    expect(toThorchainFixedPoint({ amount: 1_000_000n, decimals: 6 })).toBe(
      100_000_000n
    )
  })

  it('keeps precision on a fractional 18-decimal amount', () => {
    // 1.5 ETH
    expect(
      toThorchainFixedPoint({ amount: 15n * 10n ** 17n, decimals: 18 })
    ).toBe(150_000_000n)
  })

  it('floors sub-1e8 dust rather than rounding up', () => {
    expect(toThorchainFixedPoint({ amount: 1n, decimals: 18 })).toBe(0n)
  })
})

describe('fromThorchainFixedPoint', () => {
  it.each([
    [100_000_000n, 1],
    [150_000_000n, 1.5],
    ['1600000000', 16],
  ])('converts %s to %s', (amount, expected) => {
    expect(fromThorchainFixedPoint(amount)).toBe(expected)
  })
})
