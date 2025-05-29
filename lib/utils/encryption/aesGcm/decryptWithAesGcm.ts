import crypto from 'crypto'

import { AesGcmInput } from './AesGcmInput'

export const decryptWithAesGcm = ({ key, value, useSalt }: AesGcmInput) => {
  let cipherKey: Buffer
  let nonce: Buffer
  let ciphertext: Buffer
  let authTag: Buffer

  if (useSalt) {
    // New format with salt: [salt(16)] + [nonce(12)] + [ciphertext] + [authTag(16)]
    const salt = value.subarray(0, 16)

    // Use PBKDF2 to derive the same key using the extracted salt
    cipherKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha256')

    // Extract components from the new format
    nonce = value.subarray(16, 28) // bytes 16-27 (12 bytes)
    ciphertext = value.subarray(28, -16) // middle part (exclude salt, nonce, and authTag)
    authTag = value.subarray(-16) // last 16 bytes
  } else {
    // Legacy format: [nonce(12)] + [ciphertext] + [authTag(16)]
    // Hash the password to create a key (for backward compatibility)
    cipherKey = crypto.createHash('sha256').update(key).digest()

    // Extract components from the legacy format
    nonce = value.subarray(0, 12) // first 12 bytes
    ciphertext = value.subarray(12, -16) // middle part (exclude nonce and authTag)
    authTag = value.subarray(-16) // last 16 bytes
  }

  // Create a new AES decipher using the key and nonce
  const decipher = crypto.createDecipheriv('aes-256-gcm', cipherKey, nonce)

  // Set the authentication tag
  decipher.setAuthTag(authTag)

  // Decrypt the vault
  return Buffer.concat([decipher.update(ciphertext), decipher.final()])
}
