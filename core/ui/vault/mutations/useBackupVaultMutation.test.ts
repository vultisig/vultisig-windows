import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { describe, expect, it } from 'vitest'

import { encryptVaultAllKeyShares } from '../../passcodeEncryption/core/vaultKeyShares'
import { getReadableVaultForBackup } from './useBackupVaultMutation'

const passcode = '12345'
const legacyShare = JSON.stringify({
  pub_key: 'public-key',
  local_party_key: 'device-1',
  keygen_committee_keys: ['device-1', 'device-2'],
})
const vault: Vault = {
  name: 'Test vault',
  publicKeys: { ecdsa: 'public-key', eddsa: 'public-key' },
  signers: ['device-1', 'device-2'],
  localPartyId: 'device-1',
  hexChainCode: 'chain-code',
  keyShares: { ecdsa: legacyShare, eddsa: legacyShare },
  libType: 'GG20',
  isBackedUp: false,
  order: 0,
}
const validateLegacyVaultKeyShares = async () => {}

describe('getReadableVaultForBackup', () => {
  it('refuses to prepare a backup from ciphertext without an encryption proof', async () => {
    const encrypted = await encryptVaultAllKeyShares({
      keyShares: vault.keyShares,
      chainKeyShares: vault.chainKeyShares,
      keyShareMldsa: vault.keyShareMldsa,
      key: passcode,
    })

    await expect(
      getReadableVaultForBackup({
        vault: { ...vault, ...encrypted },
        hasPasscodeEncryption: false,
        passcode: null,
        validateLegacyVaultKeyShares,
      })
    ).rejects.toThrow('Vault key shares cannot be decrypted')
  })

  it('refuses to prepare a backup when the proof passcode cannot decrypt a share', async () => {
    const encrypted = await encryptVaultAllKeyShares({
      keyShares: vault.keyShares,
      chainKeyShares: vault.chainKeyShares,
      keyShareMldsa: vault.keyShareMldsa,
      key: passcode,
    })

    await expect(
      getReadableVaultForBackup({
        vault: { ...vault, ...encrypted },
        hasPasscodeEncryption: true,
        passcode: '99999',
        validateLegacyVaultKeyShares,
      })
    ).rejects.toThrow('Vault key shares cannot be decrypted')
  })

  it('refuses to prepare a backup from truncated ciphertext without an encryption proof', async () => {
    const truncatedCiphertext = Buffer.from([0x56, 0x4c, 0x54, 0x02]).toString(
      'base64'
    )

    await expect(
      getReadableVaultForBackup({
        vault: {
          ...vault,
          keyShares: { ...vault.keyShares, ecdsa: truncatedCiphertext },
        },
        hasPasscodeEncryption: false,
        passcode: null,
        validateLegacyVaultKeyShares,
      })
    ).rejects.toThrow('Vault key shares cannot be decrypted')
  })

  it('refuses to prepare a backup from malformed plaintext shares', async () => {
    await expect(
      getReadableVaultForBackup({
        vault: {
          ...vault,
          keyShares: { ...vault.keyShares, ecdsa: 'not-a-keyshare' },
        },
        hasPasscodeEncryption: false,
        passcode: null,
        validateLegacyVaultKeyShares,
      })
    ).rejects.toThrow('Vault key shares cannot be decrypted')
  })

  it('refuses a legacy share rejected by the native GG20 parser', async () => {
    await expect(
      getReadableVaultForBackup({
        vault,
        hasPasscodeEncryption: false,
        passcode: null,
        validateLegacyVaultKeyShares: async () => {
          throw new Error('invalid legacy local state')
        },
      })
    ).rejects.toThrow('Vault key shares cannot be decrypted')
  })

  it('prepares a backup only with fully decrypted shares', async () => {
    const encrypted = await encryptVaultAllKeyShares({
      keyShares: vault.keyShares,
      chainKeyShares: vault.chainKeyShares,
      keyShareMldsa: vault.keyShareMldsa,
      key: passcode,
    })

    await expect(
      getReadableVaultForBackup({
        vault: { ...vault, ...encrypted },
        hasPasscodeEncryption: true,
        passcode,
        validateLegacyVaultKeyShares,
      })
    ).resolves.toEqual(vault)
  })
})
