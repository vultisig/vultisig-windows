import { hexToU8a } from '@polkadot/util'
import { encodeAddress } from '@polkadot/util-crypto'
import { OtherChain } from '@vultisig/core-chain/Chain'

import { SubstrateChain } from './PolkadotSignerPayload'

/** Recipient and value of a Balances transfer read out of a dApp's call. */
type SubstrateTransfer = {
  recipient: string
  amount: bigint
}

type DecodeSubstrateTransferInput = {
  method: string
  chain: SubstrateChain
}

// `pallet_balances` sits at index 5 in both runtimes. Bittensor's is pinned by
// the SDK extrinsic builder (`chains/bittensor/signing/buildExtrinsic.ts`) and
// its test; Polkadot's by `construct_runtime!` in the relay runtime. Asset Hub
// puts Balances at 10, but its genesis hash is not one this flow accepts.
const balancesPalletIndex = 5

// `transfer_allow_death(dest, #[compact] value)` and its keep-alive twin are
// the two Balances calls shaped as recipient-plus-scalar. `transfer_all` names
// no value and every other call has an unrelated shape, so neither is decoded.
const transferCallIndices = new Set([0, 3])

const multiAddressIdVariant = 0x00
const accountIdLength = 32

// `hexToU8a` does not validate: it turns `0xnothex` into bytes and pads an odd
// length rather than rejecting either. Left unchecked, a malformed call would
// decode into a plausible-looking transfer, which is the exact failure this
// module exists to prevent.
const callHexPattern = /^0x([0-9a-fA-F]{2})*$/u

const ss58PrefixByChain: Record<SubstrateChain, number> = {
  [OtherChain.Bittensor]: 42,
  [OtherChain.Polkadot]: 0,
}

type ByteReader = {
  bytes: Uint8Array
  offset: number
}

const readU8 = (reader: ByteReader) => {
  if (reader.offset >= reader.bytes.length) {
    throw new Error('Substrate call ended mid-field')
  }

  return reader.bytes[reader.offset++]
}

const readBytes = (reader: ByteReader, length: number) => {
  if (reader.offset + length > reader.bytes.length) {
    throw new Error('Substrate call ended mid-field')
  }

  const value = reader.bytes.slice(reader.offset, reader.offset + length)
  reader.offset += length

  return value
}

// Canonical SCALE gives every value exactly one spelling: mode 0b00 covers
// 0-63, 0b01 covers 64-16,383, 0b10 covers 16,384 to 2^30-1, and 0b11 the rest
// with a non-zero most significant byte. `parity-scale-codec` rejects any other
// spelling with "out of range decoding Compact<T>", so a call carrying one is a
// call the runtime will not decode at all. Reading it anyway would put a
// confident number on Verify for bytes the chain refuses outright — the same
// defect as the zero this module replaced, wearing a plausible value.
const twoByteCompactMinimum = 64n
const fourByteCompactMinimum = 16_384n
const bigIntegerCompactMinimum = 1_073_741_824n

// Balance is u128 on both runtimes, so a wider big-integer compact is not a
// balance either side could decode.
const maxBigIntegerCompactBytes = 16

const assertCanonicalCompact = (value: bigint, minimum: bigint) => {
  if (value < minimum) {
    throw new Error('Substrate call uses a non-canonical compact integer')
  }

  return value
}

/**
 * Reads one SCALE compact integer, rejecting any encoding the runtime's own
 * codec would reject. Every width is assembled as a bigint because a four-byte
 * compact holds values past the point where JavaScript's bitwise operators
 * start treating the number as signed.
 */
const readCompact = (reader: ByteReader): bigint => {
  const first = readU8(reader)
  const mode = first & 0b11

  if (mode === 0b00) {
    return BigInt(first >>> 2)
  }

  if (mode === 0b01) {
    const raw = BigInt(first) | (BigInt(readU8(reader)) << 8n)
    return assertCanonicalCompact(raw >> 2n, twoByteCompactMinimum)
  }

  if (mode === 0b10) {
    let raw = BigInt(first)
    for (let index = 1; index < 4; index++) {
      raw |= BigInt(readU8(reader)) << BigInt(8 * index)
    }
    return assertCanonicalCompact(raw >> 2n, fourByteCompactMinimum)
  }

  const length = (first >>> 2) + 4
  if (length > maxBigIntegerCompactBytes) {
    throw new Error('Substrate call compact integer is wider than a balance')
  }

  let value = 0n
  let mostSignificantByte = 0
  for (let index = 0; index < length; index++) {
    mostSignificantByte = readU8(reader)
    value |= BigInt(mostSignificantByte) << BigInt(8 * index)
  }

  if (mostSignificantByte === 0) {
    throw new Error('Substrate call uses a non-canonical compact integer')
  }

  return assertCanonicalCompact(value, bigIntegerCompactMinimum)
}

/**
 * Decodes the recipient and value of a Balances transfer from the SCALE call
 * bytes a dApp asked the vault to sign.
 *
 * Returns `undefined` when the call is not one of the two Balances transfers:
 * a staking or subnet call carries no comparable scalar, and putting a number
 * on the Verify screen that the signed bytes do not mean is the defect this
 * exists to remove. Throws when the bytes do claim to be a transfer but do not
 * decode, so callers fail closed instead of showing a guess.
 */
export const decodeSubstrateTransfer = ({
  method,
  chain,
}: DecodeSubstrateTransferInput): SubstrateTransfer | undefined => {
  if (!callHexPattern.test(method)) {
    throw new Error('Substrate call is not a hex-encoded byte string')
  }

  const bytes = hexToU8a(method)
  const reader: ByteReader = { bytes, offset: 0 }

  const palletIndex = readU8(reader)
  const callIndex = readU8(reader)

  if (
    palletIndex !== balancesPalletIndex ||
    !transferCallIndices.has(callIndex)
  ) {
    return undefined
  }

  const addressVariant = readU8(reader)
  if (addressVariant !== multiAddressIdVariant) {
    throw new Error(
      `Unsupported Substrate MultiAddress variant ${addressVariant}`
    )
  }

  const destination = readBytes(reader, accountIdLength)
  const amount = readCompact(reader)

  // A transfer is exactly dest plus value. Anything still unread means the
  // call is not the one these indices describe, so the amount just decoded
  // cannot be trusted to be the amount that gets signed.
  if (reader.offset !== bytes.length) {
    throw new Error('Substrate transfer call has trailing bytes')
  }

  return {
    recipient: encodeAddress(destination, ss58PrefixByChain[chain]),
    amount,
  }
}
