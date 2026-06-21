import {
  encryptedEncoding,
  plainTextEncoding,
} from '@vultisig/lib-utils/encryption/config'
import { Entry } from '@vultisig/lib-utils/entities/Entry'

import { decryptWithPasscode, encryptWithPasscode } from './passcodeCipher'

/**
 * The passcode sample is a known value encrypted under the passcode; decrypting
 * it confirms a passcode guess. It uses the same PBKDF2 cipher as the key shares
 * so it can't serve as a cheap offline brute-force oracle. Decryption falls back
 * to the legacy `SHA-256(passcode)` KDF for samples written by older builds.
 */
export const encryptSample = async ({
  key,
  value,
}: Entry<string, string>): Promise<string> => {
  const [blob] = await encryptWithPasscode(key, [
    Buffer.from(value, plainTextEncoding),
  ])
  return blob.toString(encryptedEncoding)
}

export const decryptSample = async ({
  key,
  value,
}: Entry<string, string>): Promise<string> => {
  const [plaintext] = await decryptWithPasscode(key, [
    Buffer.from(value, encryptedEncoding),
  ])
  return plaintext.toString(plainTextEncoding)
}
