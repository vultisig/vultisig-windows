import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { describe, expect, it } from 'vitest'

import { withThorchainNativeCoinMetadata } from './withThorchainNativeCoinMetadata'

const srujiKey = {
  chain: Chain.THORChain,
  id: 'x/staking-x/ruji',
  address: 'thor1test',
}

describe('withThorchainNativeCoinMetadata', () => {
  it('backfills decimals and logo for a stored sRUJI coin missing them', () => {
    // Reproduces the persisted-coin bug: decimals is undefined at runtime even
    // though the type says `number`, so the send flow renders a NaN balance.
    const stored = { ...srujiKey, ticker: 'sRUJI' } as unknown as AccountCoin

    const result = withThorchainNativeCoinMetadata(stored)

    expect(result.decimals).toBe(8)
    expect(result.logo).toBe('ruji')
  })

  it('leaves a coin that already has decimals unchanged', () => {
    const complete: AccountCoin = {
      ...srujiKey,
      ticker: 'sRUJI',
      decimals: 8,
      logo: 'ruji',
    }

    expect(withThorchainNativeCoinMetadata(complete)).toBe(complete)
  })

  it('passes through a coin that is not a known THORChain native token', () => {
    const unknown = {
      chain: Chain.THORChain,
      id: 'x/not-a-real-denom',
      address: 'thor1test',
      ticker: 'FOO',
    } as unknown as AccountCoin

    const result = withThorchainNativeCoinMetadata(unknown)

    expect(result).toBe(unknown)
    expect(result.decimals).toBeUndefined()
  })
})
