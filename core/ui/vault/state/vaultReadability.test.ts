import { Chain } from '@vultisig/core-chain/Chain'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { describe, expect, it } from 'vitest'

import {
  getVaultReadabilityInputs,
  hasSameReadabilityInputs,
} from './vaultReadability'

const vault: Vault = {
  name: 'Main',
  publicKeys: { ecdsa: 'ecdsa-key', eddsa: 'eddsa-key' },
  signers: ['device-1', 'device-2'],
  hexChainCode: 'chain-code',
  keyShares: { ecdsa: 'ecdsa-share', eddsa: 'eddsa-share' },
  chainKeyShares: { [Chain.QBTC]: 'qbtc-share' },
  localPartyId: 'device-1',
  libType: 'DKLS',
  isBackedUp: true,
  order: 0,
}

const validateLegacyVaultKeyShares = async () => {}

const inputsOf = (
  overrides: Partial<Parameters<typeof getVaultReadabilityInputs>[0]> = {}
) =>
  getVaultReadabilityInputs({
    vault,
    hasPasscodeEncryption: true,
    passcode: 'passcode',
    validateLegacyVaultKeyShares,
    ...overrides,
  })

describe('hasSameReadabilityInputs', () => {
  it('holds a settled result across a coin write that rebuilds the vault object', () => {
    expect(
      hasSameReadabilityInputs({
        resolved: inputsOf(),
        current: inputsOf({ vault: { ...vault } }),
      })
    ).toBe(true)
  })

  it('invalidates when the shares are replaced under the same vault id', () => {
    expect(
      hasSameReadabilityInputs({
        resolved: inputsOf(),
        current: inputsOf({
          vault: {
            ...vault,
            keyShares: { ecdsa: 'reshared-ecdsa', eddsa: 'reshared-eddsa' },
          },
        }),
      })
    ).toBe(false)
  })

  it('invalidates when the passcode changes', () => {
    expect(
      hasSameReadabilityInputs({
        resolved: inputsOf(),
        current: inputsOf({ passcode: 'another-passcode' }),
      })
    ).toBe(false)
  })

  it('invalidates when passcode encryption is switched on or off', () => {
    expect(
      hasSameReadabilityInputs({
        resolved: inputsOf(),
        current: inputsOf({ hasPasscodeEncryption: false }),
      })
    ).toBe(false)
  })

  it('invalidates when the legacy key-share validator is swapped', () => {
    expect(
      hasSameReadabilityInputs({
        resolved: inputsOf(),
        current: inputsOf({ validateLegacyVaultKeyShares: async () => {} }),
      })
    ).toBe(false)
  })

  it('invalidates when the vault id changes', () => {
    expect(
      hasSameReadabilityInputs({
        resolved: inputsOf(),
        current: inputsOf({
          vault: {
            ...vault,
            publicKeys: { ecdsa: 'other-ecdsa', eddsa: 'other-eddsa' },
          },
        }),
      })
    ).toBe(false)
  })

  it('compares every input the snapshot carries', () => {
    const resolved = inputsOf()

    Object.keys(resolved).forEach(key => {
      expect(
        hasSameReadabilityInputs({
          resolved,
          current: { ...resolved, [key]: Symbol('changed') },
        })
      ).toBe(false)
    })
  })

  it('accepts a storage refresh with identical public keys and shares in new records', () => {
    expect(
      hasSameReadabilityInputs({
        resolved: inputsOf(),
        current: inputsOf({
          vault: {
            ...vault,
            publicKeys: { ...vault.publicKeys },
            keyShares: { ...vault.keyShares },
            chainPublicKeys: vault.chainPublicKeys
              ? { ...vault.chainPublicKeys }
              : undefined,
            chainKeyShares: { ...vault.chainKeyShares },
          },
        }),
      })
    ).toBe(true)
  })

  it('snapshots key records so in-place replacement invalidates the settled read', () => {
    const storedVault = { ...vault, keyShares: { ...vault.keyShares } }
    const resolved = inputsOf({ vault: storedVault })
    storedVault.keyShares.ecdsa = 'replacement-share'
    expect(
      hasSameReadabilityInputs({
        resolved,
        current: inputsOf({ vault: storedVault }),
      })
    ).toBe(false)
  })

  it('invalidates when a chain share is added during a refresh', () => {
    expect(
      hasSameReadabilityInputs({
        resolved: inputsOf(),
        current: inputsOf({
          vault: {
            ...vault,
            chainKeyShares: {
              ...vault.chainKeyShares,
              [Chain.Bitcoin]: 'new-bitcoin-share',
            },
          },
        }),
      })
    ).toBe(false)
  })

  it('distinguishes record keys even when their values are undefined', () => {
    expect(
      hasSameReadabilityInputs({
        resolved: inputsOf({
          vault: { ...vault, chainPublicKeys: { [Chain.Bitcoin]: undefined } },
        }),
        current: inputsOf({
          vault: { ...vault, chainPublicKeys: { [Chain.Cosmos]: undefined } },
        }),
      })
    ).toBe(false)
  })
})
