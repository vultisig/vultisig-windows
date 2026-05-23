// Several wallet adapters (cosmos-kit / graz / Keplr's own InExtensionMessage
// path) round-trip the SignDoc through Keplr's `JSONUint8Array` JSON encoder
// before it reaches the wallet. That encoder serializes `Uint8Array` as the
// string `__uint8array__<hex>` (and `bigint` as `__bigint__<value>`). Our
// inpage provider receives the dApp's call directly in the page realm, so by
// the time we hit `signDirect` the byte fields can arrive in any of these
// shapes:
//
//   1. real `Uint8Array` (no adapter involved)
//   2. `"__uint8array__<hex>"` string (Keplr JSONUint8Array wrapping)
//   3. plain `number[]` (JSON.parse of a `Uint8Array`)
//   4. Node-style `{ type: "Buffer", data: number[] }` (Buffer.toJSON output)
//
// `normalizeKeplrBytes` accepts any of the four and returns a real
// `Uint8Array`. Any other shape — or malformed contents within an accepted
// shape — throws so the caller fails loudly instead of silently signing
// garbage bytes (`Buffer.from('zz','hex')` returns an empty buffer; `new
// Uint8Array([256])` mods to 0; both are silent corruption paths we must
// refuse).

const uint8ArrayTag = '__uint8array__'
const hexPattern = /^[0-9a-fA-F]*$/

type BufferJson = { type: 'Buffer'; data: number[] }

const isBufferJson = (value: unknown): value is BufferJson => {
  if (value === null || typeof value !== 'object') return false
  if (!('type' in value) || !('data' in value)) return false
  return value.type === 'Buffer' && Array.isArray(value.data)
}

const isValidByteArray = (arr: readonly unknown[]): arr is number[] =>
  arr.every(
    n => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 255
  )

/**
 * Normalize a Keplr SignDoc byte field into a real `Uint8Array`.
 *
 * Accepts the four shapes that wallet adapters (cosmos-kit, graz, Keplr's
 * own JSONUint8Array path) serialize byte fields into, validates the
 * contents, and rejects anything else so callers can't accidentally sign
 * silently-corrupted bytes. See the file-level comment for the full
 * rationale.
 *
 * @throws if the input is not one of the supported shapes or carries
 * malformed contents (odd-length hex, non-hex chars, out-of-range or
 * non-integer array entries).
 */
export const normalizeKeplrBytes = (value: unknown): Uint8Array => {
  if (value instanceof Uint8Array) return value
  if (typeof value === 'string' && value.startsWith(uint8ArrayTag)) {
    const hex = value.slice(uint8ArrayTag.length)
    if (hex.length % 2 !== 0 || !hexPattern.test(hex)) {
      throw new Error('Invalid __uint8array__ hex payload')
    }
    return new Uint8Array(Buffer.from(hex, 'hex'))
  }
  if (Array.isArray(value)) {
    if (!isValidByteArray(value)) {
      throw new Error(
        'Byte array contains non-byte values (must be integers 0-255)'
      )
    }
    return new Uint8Array(value)
  }
  if (isBufferJson(value)) {
    if (!isValidByteArray(value.data)) {
      throw new Error(
        'Buffer JSON data contains non-byte values (must be integers 0-255)'
      )
    }
    return new Uint8Array(value.data)
  }
  throw new Error('Unsupported byte field shape on Keplr signDoc')
}
