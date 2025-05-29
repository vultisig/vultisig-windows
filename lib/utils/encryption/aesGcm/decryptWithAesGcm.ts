import crypto from 'crypto'
import { promisify } from 'util'

import { AesGcmInput } from './AesGcmInput'

const pbkdf2 = promisify(crypto.pbkdf2)

export const decryptWithAesGcm = async ({
  key,
  value,
  useSalt,
}: AesGcmInput): Promise<Buffer> => {
  let cipherKey: Buffer
  let nonce: Buffer
  let ciphertext: Buffer
  let authTag: Buffer

  if (useSalt) {
    // New format with salt: [salt(16)] + [nonce(12)] + [ciphertext] + [authTag(16)]
    const salt = value.subarray(0, 16)

    // Use async PBKDF2 to derive the same key using the extracted salt
    // Reduced to 10,000 iterations for better performance while maintaining security
    cipherKey = await pbkdf2(key, salt, 10000, 32, 'sha256')

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
