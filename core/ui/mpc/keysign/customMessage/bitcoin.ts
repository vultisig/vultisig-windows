import { sha256 } from '@noble/hashes/sha2.js'
import { KeysignSignature } from '@vultisig/core-mpc/keysign/KeysignSignature'
import { hexlify } from 'ethers'

const bitcoinMessagePrefix = Buffer.from('Bitcoin Signed Message:\n', 'utf8')

const secp256k1Order = BigInt(
  '0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141'
)

const encodeCompactSize = (length: number): Buffer => {
  if (length < 0xfd) return Buffer.from([length])
  if (length <= 0xffff) {
    const result = Buffer.alloc(3)
    result[0] = 0xfd
    result.writeUInt16LE(length, 1)
    return result
  }
  const result = Buffer.alloc(5)
  result[0] = 0xfe
  result.writeUInt32LE(length, 1)
  return result
}

type CompactSize = { value: number; size: number }

// Only the minimal encoding is accepted, so a payload has a single reading.
const decodeCompactSize = (bytes: Buffer): CompactSize | undefined => {
  const [marker] = bytes
  if (marker === undefined) return undefined
  if (marker < 0xfd) return { value: marker, size: 1 }
  if (marker === 0xfd && bytes.length >= 3) {
    const value = bytes.readUInt16LE(1)
    return value >= 0xfd ? { value, size: 3 } : undefined
  }
  if (marker === 0xfe && bytes.length >= 5) {
    const value = bytes.readUInt32LE(1)
    return value > 0xffff ? { value, size: 5 } : undefined
  }
  return undefined
}

const messagePrefix = Buffer.concat([
  encodeCompactSize(bitcoinMessagePrefix.length),
  bitcoinMessagePrefix,
])

/**
 * Builds the custom-message payload a Bitcoin `signMessage` request signs:
 * the `Bitcoin Signed Message:\n` envelope around the message's UTF-8 bytes,
 * as hex. The message is always text, including when it starts with `0x`,
 * which is how dApps and BIP-137 verifiers read it.
 */
export const getBitcoinSignedMessage = (message: string): string => {
  const messageBytes = Buffer.from(message, 'utf8')

  return hexlify(
    Buffer.concat([
      messagePrefix,
      encodeCompactSize(messageBytes.length),
      messageBytes,
    ])
  )
}

/**
 * Reverses `getBitcoinSignedMessage`: the message bytes inside a Bitcoin
 * signed-message envelope, or `undefined` when the bytes are not exactly one
 * well-formed envelope.
 */
export const unwrapBitcoinSignedMessage = (
  payload: Uint8Array
): Uint8Array | undefined => {
  const bytes = Buffer.from(payload)
  if (!bytes.subarray(0, messagePrefix.length).equals(messagePrefix)) {
    return undefined
  }

  const rest = bytes.subarray(messagePrefix.length)
  const length = decodeCompactSize(rest)
  if (!length || length.value !== rest.length - length.size) return undefined

  return rest.subarray(length.size)
}

/**
 * The digest a Bitcoin signed message is signed over: double SHA-256 of the
 * envelope bytes, as hex.
 */
export const getBitcoinSignedMessageDigest = (payload: Uint8Array): string =>
  Buffer.from(sha256(sha256(payload))).toString('hex')

const headerBases = {
  p2pkhUncompressed: 27,
  p2pkh: 31,
  'p2sh-p2wpkh': 35,
  p2wpkh: 39,
}

type EncodeBitcoinMessageSignatureInput = {
  signature: Pick<KeysignSignature, 'r' | 's' | 'recovery_id'>
  addressType: keyof typeof headerBases
}

/**
 * Encodes an MPC ECDSA signature as a 65-byte BIP-137 compact signature: a
 * header carrying the address type and recovery ID, then 32-byte `r` and `s`.
 */
export const encodeBitcoinMessageSignature = ({
  signature: { r, s, recovery_id },
  addressType,
}: EncodeBitcoinMessageSignatureInput): Uint8Array => {
  if (!recovery_id || !/^0?[0-3]$/.test(recovery_id)) {
    throw new Error('Invalid Bitcoin message signature recovery ID')
  }

  const scalars = [r, s].map(value => {
    if (!/^[0-9a-f]{1,64}$/i.test(value)) {
      throw new Error('Invalid Bitcoin message signature scalar')
    }
    const scalar = BigInt(`0x${value}`)
    if (scalar === 0n || scalar >= secp256k1Order) {
      throw new Error('Invalid Bitcoin message signature scalar')
    }
    return Buffer.from(value.padStart(64, '0'), 'hex')
  })

  return Buffer.concat([
    Buffer.from([headerBases[addressType] + parseInt(recovery_id, 16)]),
    ...scalars,
  ])
}
