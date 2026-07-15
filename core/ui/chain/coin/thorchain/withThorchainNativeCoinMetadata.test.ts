import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { describe, expect, it } from 'vitest'

import { withThorchainNativeCoinMetadata } from './withThorchainNativeCoinMetadata'

// A coin persisted before the fix has no `decimals` at runtime. `NaN` is a
// type-safe stand-in that hits the same `Number.isFinite` guard — `undefined`
// can't be assigned to the required `decimals: number` without an `as` cast.
const srujiStored: AccountCoin = {
  chain: Chain.THORChain,
  id: 'x/staking-x/ruji',
  address: 'thor1test',
  ticker: 'sRUJI',
  decimals: NaN,
}

describe('withThorchainNativeCoinMetadata', () => {
  it('backfills decimals and logo for a stored sRUJI coin missing them', () => {
    const result = withThorchainNativeCoinMetadata(srujiStored)

    expect(result.decimals).toBe(8)
    expect(result.logo).toBe('ruji')
  })

  it('leaves a coin that already has decimals unchanged', () => {
    const complete: AccountCoin = { ...srujiStored, decimals: 8, logo: 'ruji' }

    expect(withThorchainNativeCoinMetadata(complete)).toBe(complete)
  })

  it('passes through a THORChain coin that is not a known native token', () => {
    const unknown: AccountCoin = {
      ...srujiStored,
      id: 'x/not-a-real-denom',
      ticker: 'FOO',
    }

    expect(withThorchainNativeCoinMetadata(unknown)).toBe(unknown)
  })

  it('does not backfill a non-THORChain coin even when its id is a known THORChain denom', () => {
    const cosmosCoin: AccountCoin = { ...srujiStored, chain: Chain.Cosmos }

    expect(withThorchainNativeCoinMetadata(cosmosCoin)).toBe(cosmosCoin)
  })
})
