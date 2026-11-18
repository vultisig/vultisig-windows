import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { featureFlags } from '../featureFlags'
import {
  getInitialDefiChains,
  isSupportedDefiChain,
  resolveDefiChains,
  supportedDefiChains,
} from './defiChains'

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

describe('QBTC DeFi gating', () => {
  it('keeps the qbtcDefi flag off while QBTC is pre-launch', () => {
    expect(featureFlags.qbtcDefi).toBe(false)
  })

  it('does not offer QBTC as a DeFi chain', () => {
    expect(supportedDefiChains).not.toContain(Chain.QBTC)
    expect(isSupportedDefiChain(Chain.QBTC)).toBe(false)
  })

  it('drops a previously saved QBTC on read without touching other chains', () => {
    expect(
      resolveDefiChains({
        storedChains: [Chain.QBTC, Chain.THORChain, Chain.Solana],
        productBrand: 'vultisig',
      }).filter(isSupportedDefiChain)
    ).toEqual([Chain.THORChain, Chain.Solana])
  })
})
