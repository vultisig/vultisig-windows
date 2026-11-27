import { Chain } from '@vultisig/core-chain/Chain'
import { kaminoVaultRegistry } from '@vultisig/core-chain/chains/solana/kamino/registry'
import { describe, expect, it } from 'vitest'

import { withoutDefiOnlyCoins } from './withoutDefiOnlyCoins'

const [steakhouse] = kaminoVaultRegistry

const rune = { chain: Chain.THORChain, ticker: 'RUNE' }
const usdc = {
  chain: Chain.Solana,
  id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  ticker: 'USDC',
}

describe('withoutDefiOnlyCoins', () => {
  it('returns the input instance when nothing is removed', () => {
    const input = [rune, usdc]
    expect(withoutDefiOnlyCoins(input)).toBe(input)
  })

  it('drops every DeFi-only coin kind and keeps wallet coins', () => {
    const defiOnlyCoins = [
      { chain: Chain.THORChain, id: 'x/staking-x/ruji', ticker: 'sRUJI' },
      { chain: Chain.THORChain, id: 'x/staking-x/brune', ticker: 'ybRUNE' },
      {
        chain: Chain.THORChain,
        id: 'x/bow-xyk-thor-ruji-eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        ticker: 'LP-THOR.RUJI/ETH.USDC-XYK',
      },
      { chain: Chain.Solana, id: steakhouse.sharesMint, ticker: 'kVAULT' },
    ]

    expect(withoutDefiOnlyCoins([rune, ...defiOnlyCoins, usdc])).toEqual([
      rune,
      usdc,
    ])
  })
})
