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

  it.each([['RUNE'], ['']])(
    'falls back to the input when there is no chain prefix (%s)',
    asset => {
      expect(getThorchainAssetTicker(asset)).toBe(asset)
    }
  )
})
