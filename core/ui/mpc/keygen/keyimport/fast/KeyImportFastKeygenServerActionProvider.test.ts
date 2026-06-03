import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { KeyImportInput } from '../state/keyImportInput'
import {
  getKeyImportServerProtocols,
  getKeyImportServerRepresentativeChains,
} from './KeyImportFastKeygenServerActionProvider'

describe('getKeyImportServerRepresentativeChains', () => {
  it('does not register per-chain server imports for Station Terra root keys', () => {
    const input: KeyImportInput = {
      kind: 'stationTerraRoot',
      privateKeyHex: '01'.repeat(32),
      publicKeyHex: '02' + '01'.repeat(32),
      chains: [Chain.Terra, Chain.TerraClassic],
    }

    expect(getKeyImportServerRepresentativeChains(input)).toEqual([])
    expect(getKeyImportServerProtocols(input)).toEqual(['ecdsa'])
  })

  it('registers representative chains for mnemonic imports', () => {
    const input: KeyImportInput = {
      kind: 'mnemonic',
      mnemonic:
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      chains: [Chain.Terra, Chain.TerraClassic, Chain.Ethereum, Chain.BSC],
    }

    expect(getKeyImportServerRepresentativeChains(input)).toEqual([
      Chain.Terra,
      Chain.Ethereum,
    ])
    expect(getKeyImportServerProtocols(input)).toEqual(['ecdsa', 'eddsa'])
  })
})
