/**
 * Manual protobuf wire-format encoding for QBTC transactions.
 * Required because WalletCore cannot handle MLDSA keys.
 */

/** Encodes a UInt64 as a protobuf base-128 varint. */
const encodeVarint = (value: bigint): Uint8Array => {
  const bytes: number[] = []
  let v = value
  while (v > 0x7fn) {
    bytes.push(Number(v & 0x7fn) | 0x80)
    v >>= 7n
  }
  bytes.push(Number(v))
  return new Uint8Array(bytes)
}

/** Appends a varint field (wire type 0). Skips if value is 0 (proto3 default). */
export const protoVarint = (fieldNumber: number, value: bigint): Uint8Array => {
  if (value === 0n) return new Uint8Array(0)
  const tag = encodeVarint(BigInt((fieldNumber << 3) | 0))
  const data = encodeVarint(value)
  return concatBytes(tag, data)
}

/** Appends a length-delimited field (wire type 2) for raw bytes. */
export const protoBytes = (
  fieldNumber: number,
  data: Uint8Array
): Uint8Array => {
  if (data.length === 0) return new Uint8Array(0)
  const tag = encodeVarint(BigInt((fieldNumber << 3) | 2))
  const length = encodeVarint(BigInt(data.length))
  return concatBytes(tag, length, data)
}

/** Appends a length-delimited field (wire type 2) for a UTF-8 string. */
export const protoString = (fieldNumber: number, value: string): Uint8Array => {
  if (value.length === 0) return new Uint8Array(0)
  return protoBytes(fieldNumber, new TextEncoder().encode(value))
}

/** Concatenates multiple Uint8Arrays. */
export const concatBytes = (...arrays: Uint8Array[]): Uint8Array => {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }
  return result
}
