import { Chain } from '@core/chain/Chain'
import { describe, expect, it } from 'vitest'

import { toNativeSwapAsset } from './toNativeSwapAsset'

describe('toNativeSwapAsset', () => {
  it('returns CHAIN.TICKER for native fee coins', () => {
    expect(toNativeSwapAsset({ chain: Chain.Ethereum, ticker: 'ETH' })).toBe(
      'ETH.ETH'
    )
  })

  it('returns CHAIN.TICKER for RUNE', () => {
    expect(toNativeSwapAsset({ chain: Chain.THORChain, ticker: 'RUNE' })).toBe(
      'THOR.RUNE'
    )
  })

  it('returns denom directly for THORChain secure assets', () => {
    expect(
      toNativeSwapAsset({
        chain: Chain.THORChain,
        id: 'bsc-bnb',
        ticker: 'BNB',
      })
    ).toBe('bsc-bnb')
  })

  it('returns denom directly for THORChain secure assets with contract address', () => {
    expect(
      toNativeSwapAsset({
        chain: Chain.THORChain,
        id: 'eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        ticker: 'USDC',
      })
    ).toBe('eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
  })

  it('returns CHAIN.TICKER-contractAddress for tokens on other chains', () => {
    expect(
      toNativeSwapAsset({
        chain: Chain.Ethereum,
        id: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        ticker: 'USDC',
      })
    ).toBe('ETH.USDC-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
  })

  it('throws for unsupported chains', () => {
    expect(() =>
      toNativeSwapAsset({ chain: Chain.Polkadot, ticker: 'DOT' })
    ).toThrow()
  })
})
