/**
 * Minimal SCALE encoding utilities for Bittensor extrinsic construction.
 * Only implements what's needed for balance transfers.
 */

/** SCALE compact encoding for unsigned integers */
export const compactEncode = (value: bigint | number): Uint8Array => {
  const n = BigInt(value)
  if (n < 64n) {
    return new Uint8Array([Number(n) << 2])
  }
  if (n < 16384n) {
    const v = (Number(n) << 2) | 1
    return new Uint8Array([v & 0xff, (v >> 8) & 0xff])
  }
  if (n < 1073741824n) {
    const v = (Number(n) << 2) | 2
    return new Uint8Array([
      v & 0xff,
      (v >> 8) & 0xff,
      (v >> 16) & 0xff,
      (v >> 24) & 0xff,
    ])
  }
  // Big integer mode (prefix byte = number of bytes following - 4, shifted left 2, OR 3)
  const hex = n.toString(16)
  const byteLen = Math.ceil(hex.length / 2)
  const prefix = ((byteLen - 4) << 2) | 3
  const bytes = new Uint8Array(1 + byteLen)
  bytes[0] = prefix
  for (let i = 0; i < byteLen; i++) {
    const start = hex.length - (i + 1) * 2
    bytes[1 + i] = parseInt(hex.slice(Math.max(0, start), start + 2), 16)
  }
  return bytes
}

/** Encode mortal era from block number and period */
export const encodeMortalEra = (
  blockNumber: number,
  period: number
): Uint8Array => {
  const calPeriod = Math.min(
    Math.max(4, Math.pow(2, Math.ceil(Math.log2(period)))),
    65536
  )
  const phase = blockNumber % calPeriod
  const quantizeFactor = Math.max(1, calPeriod >> 12)
  const quantizedPhase = (phase / quantizeFactor) * quantizeFactor
  const encoded =
    Math.min(15, Math.max(1, Math.log2(calPeriod) - 1)) +
    ((quantizedPhase / quantizeFactor) << 4)
  return new Uint8Array([encoded & 0xff, (encoded >> 8) & 0xff])
}

/** Concatenate multiple Uint8Arrays */
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

/** Hex string (with or without 0x) to Uint8Array */
export const hexToBytes = (hex: string): Uint8Array => {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex
  const matches = clean.match(/.{1,2}/g) ?? []
  return new Uint8Array(matches.map(byte => parseInt(byte, 16)))
}
