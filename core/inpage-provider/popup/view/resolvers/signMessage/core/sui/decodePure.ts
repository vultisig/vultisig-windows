import { attempt } from '@vultisig/lib-utils/attempt'

import { PurePrimitiveHint } from './abi'

type DecodedPureValue =
  | { kind: 'bool'; value: boolean }
  | { kind: 'u8'; value: number }
  | { kind: 'u64'; value: bigint }
  | { kind: 'u128'; value: bigint }
  | { kind: 'address'; value: string }
  | { kind: 'bytes'; byteLength: number }

const bytesFromBase64 = (b64: string): Uint8Array =>
  new Uint8Array(Buffer.from(b64, 'base64'))

const readLeBigInt = (bytes: Uint8Array): bigint => {
  let value = 0n
  for (let i = bytes.length - 1; i >= 0; i--) {
    value = (value << 8n) | BigInt(bytes[i])
  }
  return value
}

const hex = (bytes: Uint8Array): string =>
  '0x' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')

/**
 * Best-effort decode of a PTB `Pure` input's BCS bytes into a recognizable
 * primitive. Sui doesn't carry per-input types in the transaction itself —
 * the byte length is our only signal — so this picks the most common Move
 * primitive for each common length:
 *   1 byte  → bool / u8
 *   8 bytes → u64 (most common: coin amounts, ids, deadlines)
 *   16 bytes → u128
 *   32 bytes → address (object id / wallet address)
 * Anything else falls through to a `bytes` label with the byte count so the
 * raw base64 can still be inspected.
 */
export const decodePureValue = (
  base64: string,
  hint?: PurePrimitiveHint | null
): DecodedPureValue => {
  const result = attempt(() => bytesFromBase64(base64))
  if ('error' in result) return { kind: 'bytes', byteLength: 0 }
  const bytes = result.data

  // ABI-driven decoding: when we know the Move type from the consuming
  // MoveCall signature, decode against THAT type rather than guessing by
  // byte length. u8/bool ambiguity disappears, and an `address` parameter
  // is rendered as an address even though it's exactly the same 32 bytes
  // BCS would emit for a u256.
  if (hint) {
    switch (hint) {
      case 'bool':
        if (bytes.length === 1) return { kind: 'bool', value: bytes[0] === 1 }
        break
      case 'u8':
        if (bytes.length === 1) return { kind: 'u8', value: bytes[0] }
        break
      case 'u16':
      case 'u32':
      case 'u64':
        if (bytes.length >= 2)
          return { kind: 'u64', value: readLeBigInt(bytes.slice(0, 8)) }
        break
      case 'u128':
        if (bytes.length === 16)
          return { kind: 'u128', value: readLeBigInt(bytes) }
        break
      case 'u256':
        if (bytes.length === 32)
          return { kind: 'u128', value: readLeBigInt(bytes) }
        break
      case 'address':
        if (bytes.length === 32) return { kind: 'address', value: hex(bytes) }
        break
    }
  }

  if (bytes.length === 1) {
    if (bytes[0] === 0 || bytes[0] === 1) {
      return { kind: 'bool', value: bytes[0] === 1 }
    }
    return { kind: 'u8', value: bytes[0] }
  }
  if (bytes.length === 8) {
    return { kind: 'u64', value: readLeBigInt(bytes) }
  }
  if (bytes.length === 16) {
    return { kind: 'u128', value: readLeBigInt(bytes) }
  }
  if (bytes.length === 32) {
    return { kind: 'address', value: hex(bytes) }
  }
  return { kind: 'bytes', byteLength: bytes.length }
}

/**
 * Short type label for a decoded Pure value — drives the index-row prefix
 * (`[3] u64`, `[8] address`, etc.).
 */
export const decodedPureLabel = (decoded: DecodedPureValue): string => {
  switch (decoded.kind) {
    case 'bool':
      return 'bool'
    case 'u8':
      return 'u8'
    case 'u64':
      return 'u64'
    case 'u128':
      return 'u128'
    case 'address':
      return 'address'
    case 'bytes':
      return `bytes (${decoded.byteLength})`
  }
}

/**
 * Human-readable representation of the decoded value. `null` means the
 * value can't be summarised in one line (e.g. arbitrary bytes) and the
 * caller should fall back to the raw base64.
 */
export const decodedPureDisplay = (
  decoded: DecodedPureValue
): string | null => {
  switch (decoded.kind) {
    case 'bool':
      return decoded.value ? 'true' : 'false'
    case 'u8':
      return decoded.value.toString()
    case 'u64':
    case 'u128':
      return decoded.value.toLocaleString('en-US')
    case 'address':
      return decoded.value
    case 'bytes':
      return null
  }
}
