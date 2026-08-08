import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { isThorchainLpCoin, withoutThorchainLpCoins } from './isThorchainLpCoin'

describe('isThorchainLpCoin', () => {
  it('returns true for LP-prefixed tickers on THORChain', () => {
    expect(
      isThorchainLpCoin({
        chain: Chain.THORChain,
        id: 'x/some-lp-denom',
        ticker: 'LP-THOR.RUJI/ETH.USDC-XYK',
      })
    ).toBe(true)
    expect(
      isThorchainLpCoin({
        chain: Chain.THORChain,
        id: 'x/another-lp-denom',
        ticker: 'lp-gaia.atom/eth.usdc-xyk',
      })
    ).toBe(true)
  })

  it('returns false for regular tokens and other chains', () => {
    expect(
      isThorchainLpCoin({
        chain: Chain.THORChain,
        id: 'x/ruji',
        ticker: 'RUJI',
      })
    ).toBe(false)
    expect(
      isThorchainLpCoin({
        chain: Chain.Ethereum,
        id: undefined,
        ticker: 'LP-THOR.RUJI/ETH.USDC-XYK',
      })
    ).toBe(false)
  })
})

describe('withoutThorchainLpCoins', () => {
  it('returns the same array instance when no LP token is present', () => {
    const input = [
      {
        chain: Chain.THORChain,
        id: 'x/ruji',
        ticker: 'RUJI',
      },
    ]
    expect(withoutThorchainLpCoins(input)).toBe(input)
  })

  it('removes only LP entries', () => {
    const liquid = {
      chain: Chain.THORChain,
      id: 'x/ruji',
      ticker: 'RUJI',
    }
    const lp = {
      chain: Chain.THORChain,
      id: 'x/some-lp-denom',
      ticker: 'LP-THOR.RUJI/ETH.USDC-XYK',
    }
    expect(withoutThorchainLpCoins([liquid, lp])).toEqual([liquid])
  })
})
