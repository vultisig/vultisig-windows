import { ed25519 } from '@noble/curves/ed25519'
import { keccak_256 } from '@noble/hashes/sha3.js'

import { fromt_derive_key_offset } from '../../../../lib/fromt/fromt_wasm'
import { MoneroStoredOutput } from './moneroScanStorage'

const moneroCurveOrder = ed25519.CURVE.n
const compactAmountRctTypes = new Set([4, 5, 6])
const commitmentMaskLabel = new TextEncoder().encode('commitment_mask')

type MoneroTxOutput = {
  stealthPublicKeyHex: string
  globalIndex?: bigint
}

type MoneroEcdhInfo = {
  amount: string
  mask?: string
}

type DeriveStoredOutputInput = {
  amount: bigint
  globalIndex: bigint
  outputKeyHex: string
  txExtra: Uint8Array
  txOutputs: MoneroTxOutput[]
  rctType?: number
  ecdhInfo?: MoneroEcdhInfo[]
  privateViewKeyHex: string
  publicSpendKeyHex: string
}

type DeriveScannedOutputInput = Omit<
  DeriveStoredOutputInput,
  'amount' | 'globalIndex' | 'rctType' | 'ecdhInfo'
> & {
  amount: bigint
  globalIndex?: bigint
}

type ParsedExtraKeys = {
  txPublicKeys: Uint8Array[]
  additionalPublicKeys: Uint8Array[]
}

const hexToBytes = (hex: string): Uint8Array => {
  const normalized = hex.toLowerCase()
  if (normalized.length % 2 !== 0) {
    throw new Error(`Invalid hex string length: ${hex.length}`)
  }

  const bytes = new Uint8Array(normalized.length / 2)
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = parseInt(normalized.slice(i, i + 2), 16)
  }
  return bytes
}

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

const normalizeHex = (hex: string): string =>
  hex.toLowerCase().padStart(64, '0')

const bytesToBigIntLE = (bytes: Uint8Array): bigint => {
  let value = BigInt(0)
  for (let i = bytes.length - 1; i >= 0; i--) {
    value = (value << BigInt(8)) + BigInt(bytes[i])
  }
  return value
}

const bigIntToBytesLE = (value: bigint, length: number): Uint8Array => {
  let remaining = value
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) {
    bytes[i] = Number(remaining & BigInt(0xff))
    remaining >>= BigInt(8)
  }
  return bytes
}

const modCurveOrder = (value: bigint): bigint => {
  const modded = value % moneroCurveOrder
  return modded >= BigInt(0) ? modded : modded + moneroCurveOrder
}

const scalarFromBytesModOrder = (bytes: Uint8Array): bigint =>
  modCurveOrder(bytesToBigIntLE(bytes))

const hashToScalarBytes = (data: Uint8Array): Uint8Array => {
  const scalar = modCurveOrder(bytesToBigIntLE(keccak_256(data)))
  if (scalar === BigInt(0)) {
    throw new Error('Keccak hash reduced to zero scalar')
  }
  return bigIntToBytesLE(scalar, 32)
}

const readVarInt = (
  bytes: Uint8Array,
  offset: number
): { value: number; nextOffset: number } => {
  let value = 0
  let shift = 0
  let cursor = offset

  while (cursor < bytes.length) {
    const byte = bytes[cursor]
    cursor += 1
    value |= (byte & 0x7f) << shift
    if ((byte & 0x80) === 0) {
      return { value, nextOffset: cursor }
    }
    shift += 7
  }

  throw new Error('Unexpected end of Monero varint')
}

const encodeVarInt = (value: number): Uint8Array => {
  const result: number[] = []
  let current = value >>> 0

  while (current >= 0x80) {
    result.push((current & 0x7f) | 0x80)
    current >>>= 7
  }

  result.push(current)
  return new Uint8Array(result)
}

export const parseMoneroTxExtraKeys = (extra: Uint8Array): ParsedExtraKeys => {
  const txPublicKeys: Uint8Array[] = []
  const additionalPublicKeys: Uint8Array[] = []
  let offset = 0

  while (offset < extra.length) {
    const tag = extra[offset]
    offset += 1

    switch (tag) {
      case 0:
        while (offset < extra.length && extra[offset] === 0) {
          offset += 1
        }
        break
      case 1:
        txPublicKeys.push(extra.slice(offset, offset + 32))
        offset += 32
        break
      case 2:
      case 3:
      case 0xde: {
        const { value, nextOffset } = readVarInt(extra, offset)
        offset = nextOffset + value
        break
      }
      case 4: {
        const { value, nextOffset } = readVarInt(extra, offset)
        offset = nextOffset
        for (let i = 0; i < value; i++) {
          additionalPublicKeys.push(extra.slice(offset, offset + 32))
          offset += 32
        }
        break
      }
      default:
        throw new Error(`Unsupported Monero tx extra tag: ${tag}`)
    }
  }

  return { txPublicKeys, additionalPublicKeys }
}

const getPrimaryTxPublicKey = (extra: Uint8Array): Uint8Array | null => {
  for (let offset = 0; offset < extra.length; ) {
    const tag = extra[offset]
    offset += 1

    if (tag === 0) {
      while (offset < extra.length && extra[offset] === 0) {
        offset += 1
      }
      continue
    }

    if (tag === 1 && offset + 32 <= extra.length) {
      return extra.slice(offset, offset + 32)
    }

    break
  }

  return null
}

const deriveSharedKeyBytes = (
  txPublicKeyBytes: Uint8Array,
  privateViewKeyBytes: Uint8Array,
  outputIndexInTx: number
): Uint8Array => {
  const txPublicKey = ed25519.Point.fromHex(txPublicKeyBytes)
  const viewScalar = scalarFromBytesModOrder(privateViewKeyBytes)
  const ecdhPoint = txPublicKey.multiply(viewScalar).clearCofactor()
  const preimage = new Uint8Array(32 + encodeVarInt(outputIndexInTx).length)
  preimage.set(ecdhPoint.toRawBytes(), 0)
  preimage.set(encodeVarInt(outputIndexInTx), 32)
  return hashToScalarBytes(preimage)
}

const deriveCommitmentMaskBytes = ({
  amount,
  outputIndexInTx,
  rctType,
  ecdhInfo,
  sharedKeyBytes,
}: {
  amount: bigint
  outputIndexInTx: number
  rctType?: number
  ecdhInfo?: MoneroEcdhInfo[]
  sharedKeyBytes: Uint8Array
}): Uint8Array => {
  if (rctType === undefined || !ecdhInfo) {
    throw new Error('Missing RingCT data for spendable Monero output')
  }

  const entry = ecdhInfo[outputIndexInTx]
  if (!entry?.amount) {
    throw new Error(`Missing RingCT ECDH info for output ${outputIndexInTx}`)
  }

  if (compactAmountRctTypes.has(rctType)) {
    const encryptedAmountBytes = hexToBytes(entry.amount)
    const compactAmountBytes =
      encryptedAmountBytes.length >= 8
        ? encryptedAmountBytes.slice(0, 8)
        : encryptedAmountBytes
    const amountMask = keccak_256(
      new Uint8Array([...new TextEncoder().encode('amount'), ...sharedKeyBytes])
    )
    const encryptedAmount = bytesToBigIntLE(compactAmountBytes)
    const decryptedAmount =
      encryptedAmount ^ bytesToBigIntLE(amountMask.slice(0, 8))
    if (decryptedAmount !== amount) {
      throw new Error(
        `Compact RingCT amount mismatch for output ${outputIndexInTx}: expected ${amount}, got ${decryptedAmount}`
      )
    }
    return hashToScalarBytes(
      new Uint8Array([...commitmentMaskLabel, ...sharedKeyBytes])
    )
  }

  if (!entry.mask) {
    throw new Error(
      `Missing original RingCT mask for output ${outputIndexInTx}`
    )
  }

  const maskShared = hashToScalarBytes(sharedKeyBytes)
  const amountShared = hashToScalarBytes(maskShared)
  const maskScalar =
    scalarFromBytesModOrder(hexToBytes(entry.mask)) -
    scalarFromBytesModOrder(maskShared)
  const amountScalar =
    scalarFromBytesModOrder(hexToBytes(entry.amount)) -
    scalarFromBytesModOrder(amountShared)
  const maskBytes = bigIntToBytesLE(modCurveOrder(maskScalar), 32)
  const decryptedAmount = bytesToBigIntLE(
    bigIntToBytesLE(modCurveOrder(amountScalar), 32).slice(0, 8)
  )

  if (decryptedAmount !== amount) {
    throw new Error(
      `Original RingCT amount mismatch for output ${outputIndexInTx}: expected ${amount}, got ${decryptedAmount}`
    )
  }

  return maskBytes
}

export const deriveStoredMoneroOutput = ({
  amount,
  globalIndex,
  outputKeyHex,
  txExtra,
  txOutputs,
  rctType,
  ecdhInfo,
  privateViewKeyHex,
  publicSpendKeyHex,
}: DeriveStoredOutputInput): MoneroStoredOutput => {
  const normalizedOutputKeyHex = normalizeHex(outputKeyHex)
  const outputIndexInTx = txOutputs.findIndex(
    output =>
      normalizeHex(output.stealthPublicKeyHex) === normalizedOutputKeyHex
  )
  if (outputIndexInTx < 0) {
    throw new Error('Unable to locate Monero output within its transaction')
  }

  const matchedGlobalIndex = txOutputs[outputIndexInTx]?.globalIndex

  const { txPublicKeys, additionalPublicKeys } = parseMoneroTxExtraKeys(txExtra)
  const spendPoint = ed25519.Point.fromHex(publicSpendKeyHex)
  const privateViewKeyBytes = hexToBytes(privateViewKeyHex)

  const candidateKeys = [
    ...txPublicKeys,
    ...(additionalPublicKeys[outputIndexInTx]
      ? [additionalPublicKeys[outputIndexInTx]]
      : []),
  ]

  if (candidateKeys.length === 0) {
    throw new Error('Monero tx extra does not contain any tx public keys')
  }

  let sharedKeyBytes: Uint8Array | null = null
  const outputPoint = ed25519.Point.fromHex(normalizedOutputKeyHex)
  for (const candidate of candidateKeys) {
    const candidateSharedKeyBytes = deriveSharedKeyBytes(
      candidate,
      privateViewKeyBytes,
      outputIndexInTx
    )
    const derivedOutputPoint = spendPoint.add(
      ed25519.Point.BASE.multiply(
        scalarFromBytesModOrder(candidateSharedKeyBytes)
      )
    )
    if (derivedOutputPoint.equals(outputPoint)) {
      sharedKeyBytes = candidateSharedKeyBytes
      break
    }
  }

  if (!sharedKeyBytes) {
    throw new Error('Unable to derive Monero key offset for spendable output')
  }

  const commitmentMaskBytes = deriveCommitmentMaskBytes({
    amount,
    outputIndexInTx,
    rctType,
    ecdhInfo,
    sharedKeyBytes,
  })

  return {
    amount: amount.toString(),
    keyOffsetHex: toHex(sharedKeyBytes),
    outputKeyHex: normalizedOutputKeyHex,
    commitmentMaskHex: toHex(commitmentMaskBytes),
    globalIndex: (globalIndex ?? matchedGlobalIndex).toString(),
    spent: false,
  }
}

export const deriveScannedMoneroOutput = ({
  amount,
  globalIndex,
  outputKeyHex,
  txExtra,
  txOutputs,
  privateViewKeyHex,
  publicSpendKeyHex,
}: DeriveScannedOutputInput): MoneroStoredOutput => {
  const normalizedOutputKeyHex = normalizeHex(outputKeyHex)
  const outputIndexInTx = txOutputs.findIndex(
    output =>
      normalizeHex(output.stealthPublicKeyHex) === normalizedOutputKeyHex
  )
  if (outputIndexInTx < 0) {
    throw new Error('Unable to locate Monero output within its transaction')
  }

  const matchedGlobalIndex = txOutputs[outputIndexInTx]?.globalIndex

  const privateViewKeyBytes = hexToBytes(privateViewKeyHex)
  const primaryTxPublicKey = getPrimaryTxPublicKey(txExtra)
  if (primaryTxPublicKey) {
    try {
      return {
        amount: amount.toString(),
        keyOffsetHex: toHex(
          fromt_derive_key_offset(
            privateViewKeyBytes,
            primaryTxPublicKey,
            BigInt(outputIndexInTx)
          )
        ),
        outputKeyHex: normalizedOutputKeyHex,
        globalIndex: (globalIndex ?? matchedGlobalIndex)?.toString(),
        spent: false,
      }
    } catch {
      // Fall back to the stricter local derivation below.
    }
  }

  const { txPublicKeys, additionalPublicKeys } = parseMoneroTxExtraKeys(txExtra)
  const spendPoint = ed25519.Point.fromHex(publicSpendKeyHex)

  const candidateKeys = [
    ...txPublicKeys,
    ...(additionalPublicKeys[outputIndexInTx]
      ? [additionalPublicKeys[outputIndexInTx]]
      : []),
  ]

  if (candidateKeys.length === 0) {
    throw new Error('Monero tx extra does not contain any tx public keys')
  }

  let sharedKeyBytes: Uint8Array | null = null
  const outputPoint = ed25519.Point.fromHex(normalizedOutputKeyHex)
  for (const candidate of candidateKeys) {
    const candidateSharedKeyBytes = deriveSharedKeyBytes(
      candidate,
      privateViewKeyBytes,
      outputIndexInTx
    )
    const derivedOutputPoint = spendPoint.add(
      ed25519.Point.BASE.multiply(
        scalarFromBytesModOrder(candidateSharedKeyBytes)
      )
    )
    if (derivedOutputPoint.equals(outputPoint)) {
      sharedKeyBytes = candidateSharedKeyBytes
      break
    }
  }

  if (!sharedKeyBytes) {
    throw new Error('Unable to derive Monero key offset for scanned output')
  }

  return {
    amount: amount.toString(),
    keyOffsetHex: toHex(sharedKeyBytes),
    outputKeyHex: normalizedOutputKeyHex,
    globalIndex: (globalIndex ?? matchedGlobalIndex)?.toString(),
    spent: false,
  }
}

export const getSpendableBalanceFromStoredMoneroOutputs = (
  outputs: MoneroStoredOutput[]
): bigint =>
  outputs.reduce(
    (total, output) =>
      output.spent || output.frozen || output.locked
        ? total
        : total + BigInt(output.amount),
    BigInt(0)
  )
