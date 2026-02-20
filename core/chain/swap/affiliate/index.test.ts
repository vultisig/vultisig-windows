import { describe, expect, it } from 'vitest'

import { getVultDiscountTier } from './index'

const toVultChainAmount = (amount: number): bigint =>
  BigInt(amount) * 10n ** 18n

describe('getVultDiscountTier', () => {
  it('returns base tier without Thorguard NFT', () => {
    expect(
      getVultDiscountTier({
        vultBalance: toVultChainAmount(100_000),
        thorguardNftBalance: 0n,
      })
    ).toBe('platinum')
  })

  it('upgrades from no tier to bronze when Thorguard NFT is present', () => {
    expect(
      getVultDiscountTier({
        vultBalance: 0n,
        thorguardNftBalance: 1n,
      })
    ).toBe('bronze')
  })

  it('upgrades bronze to silver with Thorguard NFT', () => {
    expect(
      getVultDiscountTier({
        vultBalance: toVultChainAmount(1_500),
        thorguardNftBalance: 1n,
      })
    ).toBe('silver')
  })

  it('upgrades silver to gold with Thorguard NFT', () => {
    expect(
      getVultDiscountTier({
        vultBalance: toVultChainAmount(3_000),
        thorguardNftBalance: 1n,
      })
    ).toBe('gold')
  })

  it('upgrades gold to platinum with Thorguard NFT', () => {
    expect(
      getVultDiscountTier({
        vultBalance: toVultChainAmount(7_500),
        thorguardNftBalance: 1n,
      })
    ).toBe('platinum')
  })

  it('does not upgrade platinum with Thorguard NFT', () => {
    expect(
      getVultDiscountTier({
        vultBalance: toVultChainAmount(15_000),
        thorguardNftBalance: 1n,
      })
    ).toBe('platinum')
  })

  it('does not upgrade diamond with Thorguard NFT', () => {
    expect(
      getVultDiscountTier({
        vultBalance: toVultChainAmount(100_000),
        thorguardNftBalance: 1n,
      })
    ).toBe('platinum')
  })

  it('does not upgrade ultimate with Thorguard NFT', () => {
    expect(
      getVultDiscountTier({
        vultBalance: toVultChainAmount(1_000_000),
        thorguardNftBalance: 1n,
      })
    ).toBe('ultimate')
  })
})
