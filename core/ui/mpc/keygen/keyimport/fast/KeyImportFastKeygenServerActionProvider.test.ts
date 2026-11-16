import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { KeyImportInput } from '../state/keyImportInput'
import {
  getKeyImportServerProtocols,
  getKeyImportServerRequestChains,
} from './KeyImportFastKeygenServerActionProvider'

describe('getKeyImportServerRequestChains', () => {
  it('does not register per-chain server imports for Station Terra root keys', () => {
    const input: KeyImportInput = {
      kind: 'stationTerraRoot',
      privateKeyHex: '01'.repeat(32),
      publicKeyHex: '02' + '01'.repeat(32),
      chains: [Chain.Terra, Chain.TerraClassic],
    }

    expect(getKeyImportServerRequestChains(input)).toEqual([])
    expect(getKeyImportServerProtocols(input)).toEqual(['ecdsa'])
  })

  it('registers every selected chain for mnemonic imports, including chains that share a derivation path', () => {
    const input: KeyImportInput = {
      kind: 'mnemonic',
      mnemonic:
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      chains: [Chain.Terra, Chain.TerraClassic, Chain.Ethereum, Chain.BSC],
    }

    expect(getKeyImportServerRequestChains(input)).toEqual([
      Chain.Terra,
      Chain.TerraClassic,
      Chain.Ethereum,
      Chain.BSC,
    ])
    expect(getKeyImportServerProtocols(input)).toEqual(['ecdsa', 'eddsa'])
  })
})
