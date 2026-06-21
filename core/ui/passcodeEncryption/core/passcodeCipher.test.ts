import { encryptWithAesGcm } from '@vultisig/lib-utils/encryption/aesGcm/encryptWithAesGcm'
import { decryptVaultBackupWithPassword } from '@vultisig/lib-utils/encryption/vaultBackup/decryptVaultBackupWithPassword'
import { VAULT_BACKUP_BLOB_MAGIC } from '@vultisig/lib-utils/encryption/vaultBackup/vaultBackupConstants'
import { describe, expect, it } from 'vitest'

import {
  decryptWithPasscode,
  encryptWithPasscode,
  isLegacyPasscodeBlob,
} from './passcodeCipher'

const passcode = '12345'
const shares = [
  Buffer.from('ecdsa-share'),
  Buffer.from('eddsa-share'),
  Buffer.from('mldsa-share'),
]

describe('passcodeCipher', () => {
  it('round-trips multiple values under one passcode', async () => {
    const encrypted = await encryptWithPasscode(passcode, shares)
    const decrypted = await decryptWithPasscode(passcode, encrypted)

    expect(decrypted.map(b => b.toString())).toEqual(
      shares.map(b => b.toString())
    )
  })

  it('shares one salt across a vault (single derivation) with distinct nonces', async () => {
    const encrypted = await encryptWithPasscode(passcode, shares)

    const salts = encrypted.map(b => b.subarray(4, 20).toString('hex'))
    expect(new Set(salts).size).toBe(1)

    const nonces = encrypted.map(b => b.subarray(20, 32).toString('hex'))
    expect(new Set(nonces).size).toBe(shares.length)
  })

  it('produces the PBKDF2 magic format, not the legacy format', async () => {
    const [blob] = await encryptWithPasscode(passcode, [shares[0]])

    expect(blob.subarray(0, 4)).toEqual(VAULT_BACKUP_BLOB_MAGIC)
    expect(isLegacyPasscodeBlob(blob)).toBe(false)
  })

  it('decrypts legacy SHA-256(passcode) blobs (migration path)', async () => {
    const legacy = encryptWithAesGcm({ key: passcode, value: shares[0] })

    expect(isLegacyPasscodeBlob(legacy)).toBe(true)

    const [decrypted] = await decryptWithPasscode(passcode, [legacy])
    expect(decrypted.toString()).toBe(shares[0].toString())
  })

  it('decrypts a mix of legacy and new-format blobs', async () => {
    const legacy = encryptWithAesGcm({ key: passcode, value: shares[0] })
    const [fresh] = await encryptWithPasscode(passcode, [shares[1]])

    const decrypted = await decryptWithPasscode(passcode, [legacy, fresh])
    expect(decrypted.map(b => b.toString())).toEqual([
      shares[0].toString(),
      shares[1].toString(),
    ])
  })

  it('stays wire-compatible with the vault-backup cipher', async () => {
    const [blob] = await encryptWithPasscode(passcode, [shares[0]])

    expect(decryptVaultBackupWithPassword(passcode, blob).toString()).toBe(
      shares[0].toString()
    )
  })

  it('rejects the wrong passcode', async () => {
    const encrypted = await encryptWithPasscode(passcode, shares)

    await expect(decryptWithPasscode('99999', encrypted)).rejects.toThrow()
  })
})
