import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { getLimitOrderBuyCoin } from './limitOrderBuyCoin'

describe('getLimitOrderBuyCoin', () => {
  it.each([
    ['THOR.RUNE', Chain.THORChain, 'RUNE'],
    ['BTC.BTC', Chain.Bitcoin, 'BTC'],
    ['ETH.ETH', Chain.Ethereum, 'ETH'],
  ])('resolves the gas asset %s', (targetAsset, targetChain, ticker) => {
    expect(getLimitOrderBuyCoin({ targetAsset, targetChain })?.ticker).toBe(
      ticker
    )
  })

  // The memo abbreviates the contract to its last six characters, so resolving
  // it back is a suffix match against the real address.
  it('resolves an L1 token from its abbreviated contract', () => {
    const coin = getLimitOrderBuyCoin({
      targetAsset: 'ETH.USDC-06EB48',
      targetChain: Chain.Ethereum,
    })

    expect(coin?.ticker).toBe('USDC')
    expect(coin?.id?.toLowerCase()).toBe(
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    )
  })

  it('matches the abbreviation case-insensitively', () => {
    expect(
      getLimitOrderBuyCoin({
        targetAsset: 'ETH.USDC-06eb48',
        targetChain: Chain.Ethereum,
      })?.ticker
    ).toBe('USDC')
  })

  // Showing the wrong coin's logo and price on a signing review is worse than
  // showing none, so anything unresolved must come back undefined.
  it.each([
    ['an unroutable prefix', 'XYZ.XYZ', undefined],
    [
      'a contract that matches no known token',
      'ETH.USDC-FFFFFF',
      Chain.Ethereum,
    ],
    [
      'a ticker that is neither gas asset nor known token',
      'ETH.NOTACOIN',
      Chain.Ethereum,
    ],
    ['asset notation with no symbol', 'ETH', Chain.Ethereum],
  ])('returns undefined for %s', (_label, targetAsset, targetChain) => {
    expect(getLimitOrderBuyCoin({ targetAsset, targetChain })).toBeUndefined()
  })

  // A suffix that matches a different token's address must not resolve just
  // because the tail happens to line up.
  it('requires the ticker to agree with the contract match', () => {
    expect(
      getLimitOrderBuyCoin({
        targetAsset: 'ETH.WBTC-06EB48',
        targetChain: Chain.Ethereum,
      })
    ).toBeUndefined()
  })
})
