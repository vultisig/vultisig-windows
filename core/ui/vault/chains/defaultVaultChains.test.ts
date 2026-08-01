import { Chain, defaultChains } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { getDefaultVaultChains } from './defaultVaultChains'

describe('getDefaultVaultChains', () => {
  it('keeps Vultisig default chains unchanged', () => {
    expect(getDefaultVaultChains('vultisig')).toEqual(defaultChains)
  })

  it('enables only Terra and Terra Classic for new Station vaults', () => {
    expect(getDefaultVaultChains('station')).toEqual([
      Chain.Terra,
      Chain.TerraClassic,
    ])
  })
})
