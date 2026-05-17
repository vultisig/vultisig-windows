import { decryptDatBackup } from '@core/ui/vault/import/utils/decryptDatBackup'
import { encryptWithAesGcm } from '@vultisig/lib-utils/encryption/aesGcm/encryptWithAesGcm'
import { encryptVaultBackupWithPassword } from '@vultisig/lib-utils/encryption/vaultBackup/encryptVaultBackupWithPassword'
import { Buffer } from 'buffer'
import { describe, expect, it } from 'vitest'

describe('decryptDatBackup', () => {
  it('decrypts PBKDF2 vault backup blob', async () => {
    const secret = 'correct horse battery staple'
    const plaintext = '{"vault":1}'
    const encrypted = encryptVaultBackupWithPassword(
      secret,
      Buffer.from(plaintext, 'utf8')
    )
    const backup = encrypted.buffer.slice(
      encrypted.byteOffset,
      encrypted.byteOffset + encrypted.byteLength
    ) as ArrayBuffer

    const decrypted = await decryptDatBackup({
      backup,
      password: secret,
    })

    expect(new TextDecoder().decode(decrypted)).toBe(plaintext)
  })

  it('still decrypts legacy SHA-256(password) AES-GCM blobs', async () => {
    const secret = 'legacy-pass'
    const plaintext = '{"legacy":true}'
    const encrypted = encryptWithAesGcm({
      key: secret,
      value: Buffer.from(plaintext, 'utf8'),
    })
    const backup = encrypted.buffer.slice(
      encrypted.byteOffset,
      encrypted.byteOffset + encrypted.byteLength
    ) as ArrayBuffer

    const decrypted = await decryptDatBackup({
      backup,
      password: secret,
    })

    expect(new TextDecoder().decode(decrypted)).toBe(plaintext)
  })
})
