import { describe, expect, it } from 'vitest'

import { getZcashTxidDigest } from './txHash'

const compactSize = (value: number): Uint8Array => {
  if (value < 253) return Uint8Array.from([value])
  throw new Error('Test helper only supports small CompactSize values')
}

const concatBytes = (parts: Uint8Array[]): Uint8Array => {
  const result = new Uint8Array(
    parts.reduce((sum, part) => sum + part.length, 0)
  )
  let offset = 0
  for (const part of parts) {
    result.set(part, offset)
    offset += part.length
  }
  return result
}

const filled = (length: number, value: number): Uint8Array =>
  new Uint8Array(length).fill(value)

const makeSyntheticSaplingTx = ({
  spends,
  outputs,
  transparentInputs,
  transparentOutputs,
}: {
  spends: number
  outputs: number
  transparentInputs: number
  transparentOutputs: number
}): Uint8Array => {
  const parts: Uint8Array[] = []

  parts.push(
    filled(4, 0x05),
    filled(4, 0x0a),
    Uint8Array.from([0xf0, 0x4d, 0xec, 0x4d]),
    filled(4, 0x00),
    filled(4, 0x64)
  )

  parts.push(compactSize(transparentInputs))
  for (let i = 0; i < transparentInputs; i++) {
    parts.push(
      filled(32, 0x10 + i),
      filled(4, 0x20 + i),
      compactSize(0),
      filled(4, 0x30 + i)
    )
  }

  parts.push(compactSize(transparentOutputs))
  for (let i = 0; i < transparentOutputs; i++) {
    parts.push(filled(8, 0x40 + i), compactSize(2), filled(2, 0x50 + i))
  }

  parts.push(compactSize(spends))
  for (let i = 0; i < spends; i++) {
    parts.push(filled(32, 0x60 + i), filled(32, 0x70 + i), filled(32, 0x80 + i))
  }

  parts.push(compactSize(outputs))
  for (let i = 0; i < outputs; i++) {
    parts.push(
      filled(32, 0x90 + i),
      filled(32, 0xa0 + i),
      filled(32, 0xb0 + i),
      filled(580, 0xc0 + i),
      filled(80, 0xd0 + i)
    )
  }

  if (spends > 0 || outputs > 0) {
    parts.push(filled(8, 0xe0))
  }

  if (spends > 0) {
    parts.push(filled(32, 0xe1))
  }

  for (let i = 0; i < spends; i++) {
    parts.push(filled(192, 0xe2 + i), filled(64, 0xe4 + i))
  }

  for (let i = 0; i < outputs; i++) {
    parts.push(filled(192, 0xe6 + i))
  }

  if (spends > 0 || outputs > 0) {
    parts.push(filled(64, 0xe8))
  }

  parts.push(compactSize(0))

  return concatBytes(parts)
}

describe('getZcashTxidDigest', () => {
  it('handles sapling spend transactions', () => {
    const rawTx = makeSyntheticSaplingTx({
      spends: 1,
      outputs: 1,
      transparentInputs: 0,
      transparentOutputs: 0,
    })

    const digest = getZcashTxidDigest(rawTx)

    expect(digest).toHaveLength(32)
    expect(Buffer.from(digest).toString('hex')).toBe(
      'c3d6aef496f75098cb9e5c991cd56f43410e86c74e49112d2ec49456622b64f8'
    )
  })

  it('still handles shielding transactions', () => {
    const rawTx = makeSyntheticSaplingTx({
      spends: 0,
      outputs: 1,
      transparentInputs: 1,
      transparentOutputs: 1,
    })

    const digest = getZcashTxidDigest(rawTx)

    expect(digest).toHaveLength(32)
    expect(Buffer.from(digest).toString('hex')).toBe(
      '04355c9812fa879155055e45f6c5dacca21adaae61ba84a1cf469bf662dc4fca'
    )
  })
})
