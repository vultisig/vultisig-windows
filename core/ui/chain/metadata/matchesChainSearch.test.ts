import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { matchesChainSearch } from './matchesChainSearch'

describe('matchesChainSearch', () => {
  it('matches the display name', () => {
    expect(
      matchesChainSearch({ chain: Chain.TerraClassic, query: 'terra c' })
    ).toBe(true)
    expect(matchesChainSearch({ chain: Chain.Ton, query: 'gram' })).toBe(true)
  })

  it('matches the chain identifier', () => {
    expect(
      matchesChainSearch({ chain: Chain.TerraClassic, query: 'terrac' })
    ).toBe(true)
    expect(
      matchesChainSearch({ chain: Chain.BitcoinCash, query: 'bitcoin-cash' })
    ).toBe(true)
  })

  it('ignores case', () => {
    expect(matchesChainSearch({ chain: Chain.Dydx, query: 'DYDX' })).toBe(true)
  })

  it('rejects unrelated queries', () => {
    expect(matchesChainSearch({ chain: Chain.Terra, query: 'classic' })).toBe(
      false
    )
  })
})
