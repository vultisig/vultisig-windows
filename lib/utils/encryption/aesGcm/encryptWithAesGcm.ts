import crypto from 'crypto'

import { AesGcmInput } from './AesGcmInput'

export const encryptWithAesGcm = ({
  key,
  value,
  useSalt,
}: AesGcmInput): Buffer => {
  let cipherKey: Buffer
  let salt: Buffer | null = null

  if (useSalt) {
    // Generate a random salt (16 bytes) for secure key derivation
    salt = crypto.randomBytes(16)

    // Use PBKDF2 to derive a key from the password with salt and iterations
    // 100,000 iterations is a good balance between security and performance
    cipherKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha256')
  } else {
    // Legacy approach: Hash the password to create a key (for backward compatibility)
    cipherKey = crypto.createHash('sha256').update(key).digest()
  }

  // Generate a random nonce (12 bytes for GCM)
  const nonce = crypto.randomBytes(12)

  // Create a new AES cipher using the key and nonce
  const cipher = crypto.createCipheriv('aes-256-gcm', cipherKey, nonce)

  // Encrypt the vault
  const ciphertext = Buffer.concat([cipher.update(value), cipher.final()])

  // Get the authentication tag (16 bytes)
  const authTag = cipher.getAuthTag()

  if (useSalt && salt) {
    // New format with salt: [salt(16)] + [nonce(12)] + [ciphertext] + [authTag(16)]
    return Buffer.concat([salt, nonce, ciphertext, authTag])
  } else {
    // Legacy format: [nonce(12)] + [ciphertext] + [authTag(16)]
    return Buffer.concat([nonce, ciphertext, authTag])
  }
}
