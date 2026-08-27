import { describe, expect, it } from 'vitest'

import { getLimitOrderBuyCoin } from './limitOrderBuyCoin'

const usdcContract = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

describe('getLimitOrderBuyCoin', () => {
  it.each([
    ['THOR.RUNE', 'RUNE'],
    ['BTC.BTC', 'BTC'],
    ['ETH.ETH', 'ETH'],
  ])('resolves the gas asset %s', (targetAsset, ticker) => {
    expect(getLimitOrderBuyCoin({ targetAsset })?.ticker).toBe(ticker)
  })

  // The memo abbreviates the contract to its last six characters, so resolving
  // it back is a suffix match against the real address.
  it('resolves an L1 token from its abbreviated contract', () => {
    const coin = getLimitOrderBuyCoin({ targetAsset: 'ETH.USDC-06EB48' })

    expect(coin?.ticker).toBe('USDC')
    expect(coin?.id?.toLowerCase()).toBe(usdcContract)
  })

  it('matches the abbreviation case-insensitively', () => {
    expect(
      getLimitOrderBuyCoin({ targetAsset: 'ETH.USDC-06eb48' })?.ticker
    ).toBe('USDC')
  })

  // A secured asset separates its chain with `-` and carries the whole contract
  // address, so both the chain prefix and the contract have to be read from a
  // shape dotted notation never produces.
  it('resolves a secured token from its full contract', () => {
    const coin = getLimitOrderBuyCoin({
      targetAsset: `ETH-USDC-${usdcContract}`,
    })

    expect(coin?.ticker).toBe('USDC')
    expect(coin?.id?.toLowerCase()).toBe(usdcContract)
  })

  it.each([
    ['XRP-XRP', 'XRP'],
    ['BTC-BTC', 'BTC'],
    // THORChain spells its own bank denoms in lower case.
    ['eth-eth', 'ETH'],
  ])('resolves the secured gas asset %s', (targetAsset, ticker) => {
    expect(getLimitOrderBuyCoin({ targetAsset })?.ticker).toBe(ticker)
  })

  it.each([
    ['a synth', 'BTC/BTC', 'BTC'],
    ['a trade asset', 'ETH~ETH', 'ETH'],
  ])('resolves %s', (_label, targetAsset, ticker) => {
    expect(getLimitOrderBuyCoin({ targetAsset })?.ticker).toBe(ticker)
  })

  // Showing the wrong coin's logo and price on a signing review is worse than
  // showing none, so anything unresolved must come back undefined.
  it.each([
    ['an unroutable prefix', 'XYZ.XYZ'],
    ['an unroutable secured prefix', 'XYZ-XYZ'],
    ['a contract that matches no known token', 'ETH.USDC-FFFFFF'],
    [
      'a full contract that matches no known token',
      `ETH-USDC-0x${'f'.repeat(40)}`,
    ],
    ['a ticker that is neither gas asset nor known token', 'ETH.NOTACOIN'],
    ['asset notation with no symbol', 'ETH'],
    ['a chain prefix with nothing after it', 'ETH.'],
  ])('returns undefined for %s', (_label, targetAsset) => {
    expect(getLimitOrderBuyCoin({ targetAsset })).toBeUndefined()
  })

  // A suffix that matches a different token's address must not resolve just
  // because the tail happens to line up.
  it('requires the ticker to agree with the contract match', () => {
    expect(
      getLimitOrderBuyCoin({ targetAsset: 'ETH.WBTC-06EB48' })
    ).toBeUndefined()
  })
})
