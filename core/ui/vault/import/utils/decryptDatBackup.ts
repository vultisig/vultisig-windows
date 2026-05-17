import { decryptVaultBackupWithPassword } from '@vultisig/lib-utils/encryption/vaultBackup/decryptVaultBackupWithPassword'
import { Buffer } from 'buffer'

type Input = {
  backup: ArrayBuffer
  password: string
}

/**
 * Decrypt raw `.dat` backup bytes (password-protected).
 * Supports PBKDF2 + `VLT\x02` header (Android / iOS / current desktop) and legacy SHA-256(password) + AES-GCM.
 */
export const decryptDatBackup = async ({
  backup,
  password,
}: Input): Promise<ArrayBuffer> => {
  const plaintext = decryptVaultBackupWithPassword(
    password,
    Buffer.from(backup)
  )
  const copy = Uint8Array.from(plaintext)
  return copy.buffer.slice(
    copy.byteOffset,
    copy.byteOffset + copy.byteLength
  ) as ArrayBuffer
}
