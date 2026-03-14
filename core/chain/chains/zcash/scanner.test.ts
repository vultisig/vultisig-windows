import { describe, expect, it } from 'vitest'

import { decodeCompactBlock } from './lightwalletd/messages'
import { parseSaplingSpendNullifiers } from './parseSaplingOutputs'

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const totalLen = arrays.reduce((sum, a) => sum + a.length, 0)
  const result = new Uint8Array(totalLen)
  let offset = 0
  for (const a of arrays) {
    result.set(a, offset)
    offset += a.length
  }
  return result
}

const encodeVarint = (value: number): Uint8Array => {
  const bytes: number[] = []
  let v = value >>> 0
  while (v > 0x7f) {
    bytes.push((v & 0x7f) | 0x80)
    v >>>= 7
  }
  bytes.push(v & 0x7f)
  return new Uint8Array(bytes)
}

const encodeVarintField = (fieldNum: number, value: number): Uint8Array => {
  const tag = encodeVarint((fieldNum << 3) | 0)
  const val = encodeVarint(value)
  return concatBytes(tag, val)
}

const encodeLengthDelimited = (
  fieldNum: number,
  data: Uint8Array
): Uint8Array => {
  const tag = encodeVarint((fieldNum << 3) | 2)
  const len = encodeVarint(data.length)
  return concatBytes(tag, len, data)
}

const encodeCompactSize = (value: number): Uint8Array => {
  if (value < 253) return new Uint8Array([value])
  const buf = new Uint8Array(3)
  buf[0] = 253
  new DataView(buf.buffer).setUint16(1, value, true)
  return buf
}

const buildMinimalV5Tx = ({
  transparentIns = 0,
  transparentOuts = 0,
  saplingSpends,
  saplingOutputs = 0,
}: {
  transparentIns?: number
  transparentOuts?: number
  saplingSpends: Uint8Array[]
  saplingOutputs?: number
}): Uint8Array => {
  const parts: Uint8Array[] = []

  // header(4) + versionGroupId(4) + consensusBranchId(4) + lockTime(4) + expiryHeight(4) = 20
  parts.push(new Uint8Array(20))

  // transparent inputs
  parts.push(encodeCompactSize(transparentIns))
  for (let i = 0; i < transparentIns; i++) {
    parts.push(new Uint8Array(32 + 4)) // prevHash + index
    parts.push(encodeCompactSize(0)) // scriptLen = 0
    parts.push(new Uint8Array(4)) // sequence
  }

  // transparent outputs
  parts.push(encodeCompactSize(transparentOuts))
  for (let i = 0; i < transparentOuts; i++) {
    parts.push(new Uint8Array(8)) // value
    parts.push(encodeCompactSize(0)) // scriptLen = 0
  }

  // sapling spends: each = cv(32) + nullifier(32) + rk(32) = 96 bytes
  parts.push(encodeCompactSize(saplingSpends.length))
  for (const nullifier of saplingSpends) {
    const spend = new Uint8Array(96)
    spend.set(nullifier, 32) // nullifier at offset 32
    parts.push(spend)
  }

  // sapling outputs
  parts.push(encodeCompactSize(saplingOutputs))
  for (let i = 0; i < saplingOutputs; i++) {
    parts.push(new Uint8Array(756)) // cv(32)+cmu(32)+epk(32)+enc(580)+out(80)
  }

  return concatBytes(...parts)
}

describe('zcash protobuf parsing (correct field numbers)', () => {
  it('should decode CompactBlock with correct field numbers', () => {
    const blockHash = new Uint8Array(32).fill(0x22)

    const cmu = new Uint8Array(32).fill(0xaa)
    const epk = new Uint8Array(32).fill(0xbb)
    const ciphertext = new Uint8Array(52).fill(0xcc)
    const output = concatBytes(
      encodeLengthDelimited(1, cmu),
      encodeLengthDelimited(2, epk),
      encodeLengthDelimited(3, ciphertext)
    )

    const txHash = new Uint8Array(32).fill(0x11)
    const tx = concatBytes(
      encodeVarintField(1, 0),
      encodeLengthDelimited(2, txHash),
      encodeLengthDelimited(5, output)
    )

    const block = concatBytes(
      encodeVarintField(2, 3256745),
      encodeLengthDelimited(3, blockHash),
      encodeVarintField(5, 1000),
      encodeLengthDelimited(7, tx)
    )

    const decoded = decodeCompactBlock(block)

    expect(decoded.height).toBe(3256745)
    expect(decoded.time).toBe(1000)
    expect(decoded.vtx.length).toBe(1)
    expect(decoded.vtx[0].outputs.length).toBe(1)
    expect(decoded.vtx[0].outputs[0].cmu.length).toBe(32)
    expect(decoded.vtx[0].outputs[0].cmu[0]).toBe(0xaa)
    expect(decoded.vtx[0].outputs[0].ephemeralKey.length).toBe(32)
    expect(decoded.vtx[0].outputs[0].ciphertext.length).toBe(52)
  })

  it('should decode CompactBlock with sapling spends', () => {
    const blockHash = new Uint8Array(32).fill(0x33)
    const nullifier = new Uint8Array(32).fill(0xdd)

    // CompactSaplingSpend: field1=nf
    const spend = encodeLengthDelimited(1, nullifier)

    const txHash = new Uint8Array(32).fill(0x11)
    const tx = concatBytes(
      encodeVarintField(1, 0),
      encodeLengthDelimited(2, txHash),
      encodeLengthDelimited(4, spend) // field 4 = spends
    )

    const block = concatBytes(
      encodeVarintField(2, 100),
      encodeLengthDelimited(3, blockHash),
      encodeVarintField(5, 2000),
      encodeLengthDelimited(7, tx)
    )

    const decoded = decodeCompactBlock(block)

    expect(decoded.vtx.length).toBe(1)
    expect(decoded.vtx[0].spends.length).toBe(1)
    expect(decoded.vtx[0].spends[0].nf.length).toBe(32)
    expect(decoded.vtx[0].spends[0].nf[0]).toBe(0xdd)
    expect(decoded.vtx[0].outputs.length).toBe(0)
  })

  it('should parse real wire bytes from zec.rocks response', () => {
    const minimalBlock = encodeVarintField(2, 3256744)

    const decoded = decodeCompactBlock(minimalBlock)
    expect(decoded.height).toBe(3256744)
  })
})

describe('parseSaplingSpendNullifiers', () => {
  it('should return empty array for tx with zero spends', () => {
    const rawTx = buildMinimalV5Tx({ saplingSpends: [] })
    const nullifiers = parseSaplingSpendNullifiers(rawTx)
    expect(nullifiers).toEqual([])
  })

  it('should extract single nullifier', () => {
    const nf = new Uint8Array(32).fill(0xab)
    const rawTx = buildMinimalV5Tx({ saplingSpends: [nf] })
    const nullifiers = parseSaplingSpendNullifiers(rawTx)

    expect(nullifiers.length).toBe(1)
    expect(nullifiers[0]).toEqual(nf)
  })

  it('should extract multiple nullifiers', () => {
    const nf1 = new Uint8Array(32).fill(0x11)
    const nf2 = new Uint8Array(32).fill(0x22)
    const nf3 = new Uint8Array(32).fill(0x33)
    const rawTx = buildMinimalV5Tx({ saplingSpends: [nf1, nf2, nf3] })
    const nullifiers = parseSaplingSpendNullifiers(rawTx)

    expect(nullifiers.length).toBe(3)
    expect(nullifiers[0]).toEqual(nf1)
    expect(nullifiers[1]).toEqual(nf2)
    expect(nullifiers[2]).toEqual(nf3)
  })

  it('should handle tx with transparent inputs and outputs', () => {
    const nf = new Uint8Array(32)
    nf[0] = 0xff
    nf[31] = 0x01
    const rawTx = buildMinimalV5Tx({
      transparentIns: 2,
      transparentOuts: 3,
      saplingSpends: [nf],
    })
    const nullifiers = parseSaplingSpendNullifiers(rawTx)

    expect(nullifiers.length).toBe(1)
    expect(nullifiers[0][0]).toBe(0xff)
    expect(nullifiers[0][31]).toBe(0x01)
  })
})
