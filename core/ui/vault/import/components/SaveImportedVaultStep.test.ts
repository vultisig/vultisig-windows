import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { describe, expect, it } from 'vitest'

import {
  canReplaceVaultDuringRecovery,
  hasVaultRecoveryIdentityProof,
} from './SaveImportedVaultStep'

describe('canReplaceVaultDuringRecovery', () => {
  it('allows replacing only the exact unreadable vault', () => {
    expect(
      canReplaceVaultDuringRecovery({
        existingVaultId: 'vault-a',
        importedVaultId: 'vault-a',
        recoveryVaultId: 'vault-a',
        hasRecoveryIdentityProof: true,
      })
    ).toBe(true)
  })

  it('does not bypass duplicate protection outside recovery', () => {
    expect(
      canReplaceVaultDuringRecovery({
        existingVaultId: 'vault-a',
        importedVaultId: 'vault-a',
        recoveryVaultId: null,
        hasRecoveryIdentityProof: true,
      })
    ).toBe(false)
  })

  it('does not replace a different existing vault', () => {
    expect(
      canReplaceVaultDuringRecovery({
        existingVaultId: 'vault-a',
        importedVaultId: 'vault-a',
        recoveryVaultId: 'vault-b',
        hasRecoveryIdentityProof: true,
      })
    ).toBe(false)
  })

  it('does not replace when no share cryptographically binds the vault id', () => {
    expect(
      canReplaceVaultDuringRecovery({
        existingVaultId: 'vault-a',
        importedVaultId: 'vault-a',
        recoveryVaultId: 'vault-a',
        hasRecoveryIdentityProof: false,
      })
    ).toBe(false)
  })
})

const keyImportVault: Vault = {
  name: 'KeyImport vault',
  publicKeys: { ecdsa: 'root-ecdsa', eddsa: 'root-eddsa' },
  signers: ['device-1'],
  localPartyId: 'device-1',
  hexChainCode: 'chain-code',
  keyShares: { ecdsa: '', eddsa: '' },
  chainPublicKeys: { Bitcoin: 'bitcoin-public-key' },
  chainKeyShares: { Bitcoin: 'bitcoin-keyshare' },
  libType: 'KeyImport',
  isBackedUp: true,
  order: 0,
}

describe('hasVaultRecoveryIdentityProof', () => {
  it('binds chain-only KeyImport recovery to the damaged vault metadata', () => {
    expect(
      hasVaultRecoveryIdentityProof({
        existingVault: keyImportVault,
        importedVault: keyImportVault,
      })
    ).toBe(true)
  })

  it('rejects a chain-only KeyImport backup for a different public key', () => {
    expect(
      hasVaultRecoveryIdentityProof({
        existingVault: keyImportVault,
        importedVault: {
          ...keyImportVault,
          chainPublicKeys: { Bitcoin: 'other-public-key' },
        },
      })
    ).toBe(false)
  })
})
