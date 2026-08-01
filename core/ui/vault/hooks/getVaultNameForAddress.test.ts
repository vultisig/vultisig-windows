import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it, vi } from 'vitest'

import { getVaultNameForAddress } from './getVaultNameForAddress'

const knownAddress = '5Fr4VVaBW4uKnownVaultAddress'

describe('getVaultNameForAddress', () => {
  it('resolves a vault from an enabled coin without deriving an address', () => {
    const deriveAddress = vi.fn(() => null)

    expect(
      getVaultNameForAddress({
        address: knownAddress,
        chain: Chain.Bittensor,
        vaults: [
          {
            name: 'Known Vault',
            coins: [{ chain: Chain.Bittensor, address: knownAddress }],
          },
        ],
        deriveAddress,
      })
    ).toBe('Known Vault')
    expect(deriveAddress).not.toHaveBeenCalled()
  })

  it('derives an address when the chain is not enabled for the vault', () => {
    expect(
      getVaultNameForAddress({
        address: knownAddress,
        chain: Chain.Bittensor,
        vaults: [{ name: 'Known Vault', coins: [] }],
        deriveAddress: () => knownAddress,
      })
    ).toBe('Known Vault')
  })

  it('returns null when neither stored nor derived addresses match', () => {
    expect(
      getVaultNameForAddress({
        address: knownAddress,
        chain: Chain.Bittensor,
        vaults: [{ name: 'Other Vault', coins: [] }],
        deriveAddress: () => '5DifferentAddress',
      })
    ).toBeNull()
  })

  it('normalizes EVM address casing', () => {
    expect(
      getVaultNameForAddress({
        address: '0xABCDEF',
        chain: Chain.Ethereum,
        vaults: [
          {
            name: 'EVM Vault',
            coins: [{ chain: Chain.Arbitrum, address: '0xabcdef' }],
          },
        ],
        deriveAddress: () => null,
      })
    ).toBe('EVM Vault')
  })
})
