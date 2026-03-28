import { toBech32 } from '@cosmjs/encoding'
import { ripemd160 } from '@noble/hashes/legacy.js'
import { sha256 } from '@noble/hashes/sha2.js'

const qbtcBech32Prefix = 'qbtc'

/** Derives a QBTC address from an MLDSA public key using Bech32(RIPEMD160(SHA256(pubkey))). */
export const deriveQbtcAddress = (mldsaPublicKeyHex: string): string => {
  const pubKeyBytes = Buffer.from(mldsaPublicKeyHex, 'hex')
  const hash = ripemd160(sha256(pubKeyBytes))
  return toBech32(qbtcBech32Prefix, hash)
}
