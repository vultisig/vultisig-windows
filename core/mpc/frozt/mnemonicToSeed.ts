import { pbkdf2 } from '@noble/hashes/pbkdf2.js'
import { sha512 } from '@noble/hashes/sha2.js'

export const mnemonicToSeed = (mnemonic: string): Uint8Array => {
  return pbkdf2(sha512, mnemonic, 'mnemonic', { c: 2048, dkLen: 64 })
}
