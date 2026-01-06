import { sha512 } from '@noble/hashes/sha2.js'

const ed25519GroupOrder = BigInt(
  '0x1000000000000000000000000000000014DEF9DEA2F79CD65812631A5CF5D3ED'
)

const clampScalar = (scalar: Uint8Array): Uint8Array => {
  const clamped = new Uint8Array(scalar)
  clamped[0] &= 0xf8
  clamped[31] &= 0x3f
  clamped[31] |= 0x40
  return clamped
}

const littleEndianToBigInt = (bytes: Uint8Array): bigint => {
  let result = BigInt(0)
  for (let i = bytes.length - 1; i >= 0; i--) {
    result = (result << BigInt(8)) | BigInt(bytes[i])
  }
  return result
}

const bigIntToLittleEndian = (value: bigint, length: number): Uint8Array => {
  const result = new Uint8Array(length)
  let remaining = value
  for (let i = 0; i < length; i++) {
    result[i] = Number(remaining & BigInt(0xff))
    remaining >>= BigInt(8)
  }
  return result
}

const reduceModL = (scalar: Uint8Array): Uint8Array => {
  const value = littleEndianToBigInt(scalar)
  const reduced = value % ed25519GroupOrder
  return bigIntToLittleEndian(reduced, 32)
}

export const clampThenUniformScalar = (seed: Uint8Array): Uint8Array => {
  if (seed.length !== 32) {
    throw new Error('Seed must be 32 bytes')
  }

  const hash = sha512(seed)
  const first32 = hash.slice(0, 32)
  const clamped = clampScalar(first32)
  return reduceModL(clamped)
}
