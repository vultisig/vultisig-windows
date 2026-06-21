import { encryptWithAesGcm } from '@vultisig/lib-utils/encryption/aesGcm/encryptWithAesGcm'
import { decryptVaultBackupWithPassword } from '@vultisig/lib-utils/encryption/vaultBackup/decryptVaultBackupWithPassword'
import { VAULT_BACKUP_BLOB_MAGIC } from '@vultisig/lib-utils/encryption/vaultBackup/vaultBackupConstants'
import { createCipheriv, createHash, randomBytes } from 'crypto'
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

/** A legacy `SHA-256(passcode)` blob (`nonce || ciphertext || tag`) whose random
 * 12-byte nonce happens to start with the PBKDF2 magic bytes. */
const legacyBlobWithMagicNonce = (value: Buffer): Buffer => {
  const key = createHash('sha256').update(passcode).digest()
  const iv = Buffer.concat([VAULT_BACKUP_BLOB_MAGIC, randomBytes(8)])
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(value), cipher.final()])
  return Buffer.concat([iv, ciphertext, cipher.getAuthTag()])
}

describe('passcodeCipher', () => {
  it('round-trips multiple values under one passcode', async () => {
    const encrypted = await encryptWithPasscode({ passcode, values: shares })
    const decrypted = await decryptWithPasscode({
      passcode,
      values: encrypted,
    })

    expect(decrypted.map(b => b.toString())).toEqual(
      shares.map(b => b.toString())
    )
  })

  it('shares one salt across a vault (single derivation) with distinct nonces', async () => {
    const encrypted = await encryptWithPasscode({ passcode, values: shares })

    const salts = encrypted.map(b => b.subarray(4, 20).toString('hex'))
    expect(new Set(salts).size).toBe(1)

    const nonces = encrypted.map(b => b.subarray(20, 32).toString('hex'))
    expect(new Set(nonces).size).toBe(shares.length)
  })

  it('produces the PBKDF2 magic format, not the legacy format', async () => {
    const [blob] = await encryptWithPasscode({ passcode, values: [shares[0]] })

    expect(blob.subarray(0, 4)).toEqual(VAULT_BACKUP_BLOB_MAGIC)
    expect(isLegacyPasscodeBlob(blob)).toBe(false)
  })

  it('decrypts legacy SHA-256(passcode) blobs (migration path)', async () => {
    const legacy = encryptWithAesGcm({ key: passcode, value: shares[0] })

    expect(isLegacyPasscodeBlob(legacy)).toBe(true)

    const [decrypted] = await decryptWithPasscode({
      passcode,
      values: [legacy],
    })
    expect(decrypted.toString()).toBe(shares[0].toString())
  })

  it('decrypts a mix of legacy and new-format blobs', async () => {
    const legacy = encryptWithAesGcm({ key: passcode, value: shares[0] })
    const [fresh] = await encryptWithPasscode({
      passcode,
      values: [shares[1]],
    })

    const decrypted = await decryptWithPasscode({
      passcode,
      values: [legacy, fresh],
    })
    expect(decrypted.map(b => b.toString())).toEqual([
      shares[0].toString(),
      shares[1].toString(),
    ])
  })

  it('decrypts a legacy blob whose nonce collides with the PBKDF2 magic', async () => {
    // Long enough that the blob clears the PBKDF2 header+tag length check, so it
    // is first attempted as PBKDF2 and must fall back to the legacy KDF.
    const value = Buffer.from('a-key-share-long-enough-to-collide')
    const legacy = legacyBlobWithMagicNonce(value)

    const [decrypted] = await decryptWithPasscode({
      passcode,
      values: [legacy],
    })
    expect(decrypted.toString()).toBe(value.toString())
  })

  it('stays wire-compatible with the vault-backup cipher', async () => {
    const [blob] = await encryptWithPasscode({ passcode, values: [shares[0]] })

    expect(decryptVaultBackupWithPassword(passcode, blob).toString()).toBe(
      shares[0].toString()
    )
  })

  it('rejects the wrong passcode', async () => {
    const encrypted = await encryptWithPasscode({ passcode, values: shares })

    await expect(
      decryptWithPasscode({ passcode: '99999', values: encrypted })
    ).rejects.toThrow()
  })
})
