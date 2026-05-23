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
// `Uint8Array`. Any other shape throws so the caller fails loudly instead of
// silently signing garbage bytes.

const uint8ArrayTag = '__uint8array__'

type BufferJson = { type: 'Buffer'; data: number[] }

const isBufferJson = (value: unknown): value is BufferJson =>
  value !== null &&
  typeof value === 'object' &&
  (value as { type?: unknown }).type === 'Buffer' &&
  Array.isArray((value as { data?: unknown }).data)

export const normalizeKeplrBytes = (value: unknown): Uint8Array => {
  if (value instanceof Uint8Array) return value
  if (typeof value === 'string' && value.startsWith(uint8ArrayTag)) {
    return new Uint8Array(Buffer.from(value.slice(uint8ArrayTag.length), 'hex'))
  }
  if (Array.isArray(value)) return new Uint8Array(value)
  if (isBufferJson(value)) return new Uint8Array(value.data)
  throw new Error('Unsupported byte field shape on Keplr signDoc')
}
