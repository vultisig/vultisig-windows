import { Chain, defaultChains } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { getDefaultVaultChains } from './defaultVaultChains'

describe('getDefaultVaultChains', () => {
  it('keeps Vultisig default chains unchanged', () => {
    expect(getDefaultVaultChains('vultisig')).toEqual(defaultChains)
  })

  it('adds Terra and Terra Classic for Station vaults', () => {
    const chains = getDefaultVaultChains('station')

    expect(chains).toEqual(
      expect.arrayContaining([Chain.Terra, Chain.TerraClassic])
    )
    expect(chains).toEqual([...new Set(chains)])
  })
})
