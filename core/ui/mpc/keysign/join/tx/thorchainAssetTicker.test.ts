import { describe, expect, it } from 'vitest'

import { getThorchainAssetTicker } from './thorchainAssetTicker'

describe('getThorchainAssetTicker', () => {
  it.each([
    ['THOR.RUNE', 'RUNE'],
    ['BTC.BTC', 'BTC'],
    ['ETH.ETH', 'ETH'],
    // L1 tokens carry an abbreviated contract the co-signer shouldn't see.
    ['ETH.USDC-06EB48', 'USDC'],
    ['ETH.USDT-EC7', 'USDT'],
    ['AVAX.USDC-0X1234', 'USDC'],
    // Secured assets keep the chain prefix inside the symbol.
    ['THOR.BTC-BTC', 'BTC'],
  ])('reads %s as %s', (asset, ticker) => {
    expect(getThorchainAssetTicker(asset)).toBe(ticker)
  })

  // Secured denoms separate the chain with `-` and carry the FULL contract
  // address, so a dot-only split leaves the whole 40-plus character denom
  // standing in for the ticker on every screen that renders one.
  it.each([
    ['XRP-XRP', 'XRP'],
    ['BTC-BTC', 'BTC'],
    ['ETH-USDC-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 'USDC'],
    ['eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 'usdc'],
  ])('reads the secured asset %s as %s', (asset, ticker) => {
    expect(getThorchainAssetTicker(asset)).toBe(ticker)
  })

  it.each([
    // Synths.
    ['BTC/BTC', 'BTC'],
    ['ETH/USDC-0X1234', 'USDC'],
    // Trade assets.
    ['ETH~ETH', 'ETH'],
    ['AVAX~USDC-0X1234', 'USDC'],
  ])('reads the THORChain-held asset %s as %s', (asset, ticker) => {
    expect(getThorchainAssetTicker(asset)).toBe(ticker)
  })

  it.each([['RUNE'], [''], ['ETH.']])(
    'falls back to the input when no ticker can be read (%s)',
    asset => {
      expect(getThorchainAssetTicker(asset)).toBe(asset)
    }
  )
})
