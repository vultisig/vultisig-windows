import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { normaliseChainToMatchPoolChain } from './config'

describe('normaliseChainToMatchPoolChain', () => {
  it.each([
    ['AVAX', Chain.Avalanche],
    ['BASE', Chain.Base],
    ['BCH', Chain.BitcoinCash],
    ['BTC', Chain.Bitcoin],
    ['DOGE', Chain.Dogecoin],
    ['ETH', Chain.Ethereum],
    ['GAIA', Chain.Cosmos],
    ['LTC', Chain.Litecoin],
    ['THOR', Chain.THORChain],
    ['XRP', Chain.Ripple],
  ])('maps pool alias %s to canonical chain %s', (poolAlias, chain) => {
    expect(normaliseChainToMatchPoolChain(poolAlias)).toBe(
      normaliseChainToMatchPoolChain(chain)
    )
  })

  it('normalizes Bitcoin Cash with the canonical ASCII hyphen', () => {
    expect(normaliseChainToMatchPoolChain('BCH')).toBe('BITCOIN-CASH')
  })
})
