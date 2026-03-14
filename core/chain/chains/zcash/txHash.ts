import { blake2b } from '@noble/hashes/blake2.js'

type TransparentInput = {
  prevTxid: Uint8Array
  voutBytes: Uint8Array
  sequenceBytes: Uint8Array
}

type TransparentOutput = {
  valueBytes: Uint8Array
  scriptPubKey: Uint8Array
}

type SaplingOutput = {
  cv: Uint8Array
  cmu: Uint8Array
  ephemeralKey: Uint8Array
  encCiphertext: Uint8Array
  outCiphertext: Uint8Array
}

type SaplingSpend = {
  cv: Uint8Array
  nullifier: Uint8Array
  rk: Uint8Array
}

class Reader {
  constructor(
    private readonly bytes: Uint8Array,
    private offset = 0
  ) {}

  readBytes(length: number): Uint8Array {
    const end = this.offset + length
    if (end > this.bytes.length) {
      throw new Error('Unexpected end of Zcash transaction')
    }
    const value = this.bytes.slice(this.offset, end)
    this.offset = end
    return value
  }

  readCompactSize(): number {
    const prefix = this.readBytes(1)[0]
    if (prefix < 253) return prefix
    if (prefix === 253) {
      return new DataView(this.readBytes(2).buffer).getUint16(0, true)
    }
    if (prefix === 254) {
      return new DataView(this.readBytes(4).buffer).getUint32(0, true)
    }

    const value = new DataView(this.readBytes(8).buffer).getBigUint64(0, true)
    if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error('CompactSize exceeds JS safe integer range')
    }
    return Number(value)
  }

  get position(): number {
    return this.offset
  }
}

const compactSize = (value: number): Uint8Array => {
  if (value < 253) return Uint8Array.from([value])
  if (value <= 0xffff) {
    const result = new Uint8Array(3)
    result[0] = 253
    new DataView(result.buffer).setUint16(1, value, true)
    return result
  }
  if (value <= 0xffff_ffff) {
    const result = new Uint8Array(5)
    result[0] = 254
    new DataView(result.buffer).setUint32(1, value, true)
    return result
  }

  const result = new Uint8Array(9)
  result[0] = 255
  new DataView(result.buffer).setBigUint64(1, BigInt(value), true)
  return result
}

const concatBytes = (parts: Uint8Array[]): Uint8Array => {
  const length = parts.reduce((sum, part) => sum + part.length, 0)
  const result = new Uint8Array(length)
  let offset = 0
  for (const part of parts) {
    result.set(part, offset)
    offset += part.length
  }
  return result
}

const personalization = (label: string): Uint8Array =>
  new Uint8Array(Buffer.from(label, 'ascii'))

const hashPersonalized = (
  label: string | Uint8Array,
  data: Uint8Array
): Uint8Array =>
  blake2b(data, {
    dkLen: 32,
    personalization: typeof label === 'string' ? personalization(label) : label,
  })

const getFinalPersonalization = (branchIdBytes: Uint8Array): Uint8Array => {
  const result = new Uint8Array(16)
  result.set(Buffer.from('ZcashTxHash_', 'ascii'), 0)
  result.set(branchIdBytes, 12)
  return result
}

const getTransparentTxidDigest = (
  inputs: TransparentInput[],
  outputs: TransparentOutput[]
): Uint8Array => {
  const prevouts = hashPersonalized(
    'ZTxIdPrevoutHash',
    concatBytes(inputs.flatMap(input => [input.prevTxid, input.voutBytes]))
  )
  const sequences = hashPersonalized(
    'ZTxIdSequencHash',
    concatBytes(inputs.map(input => input.sequenceBytes))
  )
  const txOutputs = hashPersonalized(
    'ZTxIdOutputsHash',
    concatBytes(
      outputs.flatMap(output => [
        output.valueBytes,
        compactSize(output.scriptPubKey.length),
        output.scriptPubKey,
      ])
    )
  )

  return hashPersonalized(
    'ZTxIdTranspaHash',
    concatBytes([prevouts, sequences, txOutputs])
  )
}

const getSaplingOutputsDigest = (outputs: SaplingOutput[]): Uint8Array => {
  const compact = hashPersonalized(
    'ZTxIdSOutC__Hash',
    concatBytes(
      outputs.flatMap(output => [
        output.cmu,
        output.ephemeralKey,
        output.encCiphertext.slice(0, 52),
      ])
    )
  )
  const memos = hashPersonalized(
    'ZTxIdSOutM__Hash',
    concatBytes(outputs.map(output => output.encCiphertext.slice(52, 564)))
  )
  const nonCompact = hashPersonalized(
    'ZTxIdSOutN__Hash',
    concatBytes(
      outputs.flatMap(output => [
        output.cv,
        output.encCiphertext.slice(564),
        output.outCiphertext,
      ])
    )
  )

  return hashPersonalized(
    'ZTxIdSOutputHash',
    concatBytes([compact, memos, nonCompact])
  )
}

const getSaplingDigest = (
  spends: SaplingSpend[],
  outputs: SaplingOutput[],
  valueBalanceBytes: Uint8Array,
  anchorBytes: Uint8Array | null
): Uint8Array => {
  if (spends.length === 0 && outputs.length === 0) {
    return hashPersonalized('ZTxIdSaplingHash', new Uint8Array())
  }

  const spendsCompact = hashPersonalized(
    'ZTxIdSSpendCHash',
    concatBytes(spends.map(spend => spend.nullifier))
  )
  const spendsNonCompact = hashPersonalized(
    'ZTxIdSSpendNHash',
    concatBytes(
      spends.flatMap(spend => [
        spend.cv,
        anchorBytes ?? new Uint8Array(),
        spend.rk,
      ])
    )
  )
  const spendsDigest = hashPersonalized(
    'ZTxIdSSpendsHash',
    concatBytes([spendsCompact, spendsNonCompact])
  )
  const outputsDigest = getSaplingOutputsDigest(outputs)

  return hashPersonalized(
    'ZTxIdSaplingHash',
    concatBytes([spendsDigest, outputsDigest, valueBalanceBytes])
  )
}

export const getZcashTxidDigest = (rawTx: Uint8Array): Uint8Array => {
  const reader = new Reader(rawTx)
  const headerBytes = reader.readBytes(20)
  const branchIdBytes = headerBytes.slice(8, 12)

  const transparentInputs = Array.from(
    { length: reader.readCompactSize() },
    (): TransparentInput => {
      const prevTxid = reader.readBytes(32)
      const voutBytes = reader.readBytes(4)
      const scriptSigLength = reader.readCompactSize()
      reader.readBytes(scriptSigLength)
      const sequenceBytes = reader.readBytes(4)

      return {
        prevTxid,
        voutBytes,
        sequenceBytes,
      }
    }
  )

  const transparentOutputs = Array.from(
    { length: reader.readCompactSize() },
    (): TransparentOutput => {
      const valueBytes = reader.readBytes(8)
      const scriptLength = reader.readCompactSize()
      const scriptPubKey = reader.readBytes(scriptLength)

      return {
        valueBytes,
        scriptPubKey,
      }
    }
  )

  const saplingSpends = Array.from(
    { length: reader.readCompactSize() },
    (): SaplingSpend => ({
      cv: reader.readBytes(32),
      nullifier: reader.readBytes(32),
      rk: reader.readBytes(32),
    })
  )

  const saplingOutputs = Array.from(
    { length: reader.readCompactSize() },
    (): SaplingOutput => ({
      cv: reader.readBytes(32),
      cmu: reader.readBytes(32),
      ephemeralKey: reader.readBytes(32),
      encCiphertext: reader.readBytes(580),
      outCiphertext: reader.readBytes(80),
    })
  )

  const hasSaplingData = saplingSpends.length > 0 || saplingOutputs.length > 0
  const valueBalanceBytes = hasSaplingData
    ? reader.readBytes(8)
    : new Uint8Array(8)
  const anchorBytes = saplingSpends.length > 0 ? reader.readBytes(32) : null

  for (let i = 0; i < saplingSpends.length; i++) {
    reader.readBytes(192)
  }

  for (let i = 0; i < saplingSpends.length; i++) {
    reader.readBytes(64)
  }

  for (let i = 0; i < saplingOutputs.length; i++) {
    reader.readBytes(192)
  }

  if (hasSaplingData) {
    reader.readBytes(64)
  }

  const orchardActions = reader.readCompactSize()
  if (orchardActions !== 0 || reader.position !== rawTx.length) {
    throw new Error('Unsupported Zcash tx shape: Orchard data present')
  }

  const headerDigest = hashPersonalized('ZTxIdHeadersHash', headerBytes)
  const transparentDigest = getTransparentTxidDigest(
    transparentInputs,
    transparentOutputs
  )
  const saplingDigest = getSaplingDigest(
    saplingSpends,
    saplingOutputs,
    valueBalanceBytes,
    anchorBytes
  )
  const orchardDigest = hashPersonalized('ZTxIdOrchardHash', new Uint8Array())

  return hashPersonalized(
    getFinalPersonalization(branchIdBytes),
    concatBytes([headerDigest, transparentDigest, saplingDigest, orchardDigest])
  )
}
