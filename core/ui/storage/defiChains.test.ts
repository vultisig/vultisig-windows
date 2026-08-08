import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { getInitialDefiChains, resolveDefiChains } from './defiChains'

describe('getInitialDefiChains', () => {
  it('keeps Vultisig first-run DeFi chains empty', () => {
    expect(getInitialDefiChains('vultisig')).toEqual([])
  })

  it('enables Terra and Terra Classic for Station first-run DeFi', () => {
    expect(getInitialDefiChains('station')).toEqual([
      Chain.Terra,
      Chain.TerraClassic,
    ])
  })
})

describe('resolveDefiChains', () => {
  it('uses Station defaults when storage is missing', () => {
    expect(
      resolveDefiChains({
        productBrand: 'station',
      })
    ).toEqual([Chain.Terra, Chain.TerraClassic])
  })

  it('respects a saved empty Station chain list', () => {
    expect(
      resolveDefiChains({
        storedChains: [],
        productBrand: 'station',
      })
    ).toEqual([])
  })
})
