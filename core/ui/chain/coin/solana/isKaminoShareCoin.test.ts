import { Chain } from '@vultisig/core-chain/Chain'
import { kaminoVaultRegistry } from '@vultisig/core-chain/chains/solana/kamino/registry'
import { describe, expect, it } from 'vitest'

import { isKaminoShareCoin, withoutKaminoShareCoins } from './isKaminoShareCoin'

const [steakhouse] = kaminoVaultRegistry
const usdc = {
  chain: Chain.Solana,
  id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
}
const shareCoin = { chain: Chain.Solana, id: steakhouse.sharesMint }

describe('isKaminoShareCoin', () => {
  it('recognises every curated vault share mint', () => {
    for (const { sharesMint } of kaminoVaultRegistry) {
      expect(isKaminoShareCoin({ chain: Chain.Solana, id: sharesMint })).toBe(
        true
      )
    }
  })

  it('leaves ordinary Solana coins alone', () => {
    expect(isKaminoShareCoin(usdc)).toBe(false)
    expect(isKaminoShareCoin({ chain: Chain.Solana })).toBe(false)
  })

  it('is chain-scoped — the same id on another chain is a different token', () => {
    expect(
      isKaminoShareCoin({ chain: Chain.Ethereum, id: steakhouse.sharesMint })
    ).toBe(false)
  })
})

describe('withoutKaminoShareCoins', () => {
  it('returns the input instance when nothing is removed', () => {
    const input = [usdc]
    expect(withoutKaminoShareCoins(input)).toBe(input)
  })

  it('drops share mints so a position is not counted twice', () => {
    expect(withoutKaminoShareCoins([usdc, shareCoin])).toEqual([usdc])
  })
})
