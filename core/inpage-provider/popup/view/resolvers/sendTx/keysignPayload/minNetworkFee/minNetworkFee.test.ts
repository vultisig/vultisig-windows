import { networks, payments, Psbt } from 'bitcoinjs-lib'
import { describe, expect, it } from 'vitest'

import { getPsbtFee, getPsbtMinVsize } from './psbtFee'
import { getZcashConventionalFee } from './zip317'

const p2pkhOutput = 34n

describe('getZcashConventionalFee', () => {
  it('returns the 10,000 zat floor for a simple 1-in 2-out send', () => {
    expect(
      getZcashConventionalFee({
        inputCount: 1,
        outputSizes: [p2pkhOutput, p2pkhOutput],
      })
    ).toBe(10_000n)
  })

  it('scales with input count beyond the grace window', () => {
    expect(
      getZcashConventionalFee({
        inputCount: 4,
        outputSizes: [p2pkhOutput, p2pkhOutput],
      })
    ).toBe(20_000n)
  })

  it('charges input actions from serialized bytes, not raw count', () => {
    // 75 P2PKH inputs: ceil(75 * 148 / 150) = 74 actions, not 75
    expect(
      getZcashConventionalFee({
        inputCount: 75,
        outputSizes: [p2pkhOutput, p2pkhOutput],
      })
    ).toBe(370_000n)
  })

  it('counts large OP_RETURN outputs as multiple actions', () => {
    // 80-byte memo: 9 + 3 + 80 = 92 bytes -> with two p2pkh outputs,
    // ceil(160 / 34) = 5 actions -> 25,000 zats
    expect(
      getZcashConventionalFee({
        inputCount: 1,
        outputSizes: [p2pkhOutput, p2pkhOutput, 92n],
      })
    ).toBe(25_000n)
  })
})

const makePsbt = ({
  inputValues,
  outputValues,
}: {
  inputValues: bigint[]
  outputValues: bigint[]
}) => {
  const psbt = new Psbt({ network: networks.bitcoin })
  const keyHash = Buffer.alloc(20, 1)
  const { output: script } = payments.p2wpkh({
    hash: keyHash,
    network: networks.bitcoin,
  })

  inputValues.forEach((value, index) => {
    psbt.addInput({
      hash: Buffer.alloc(32, index + 1),
      index: 0,
      witnessUtxo: { script: script!, value },
    })
  })
  outputValues.forEach(value => {
    psbt.addOutput({ script: script!, value })
  })

  return psbt
}

describe('getPsbtFee', () => {
  it('returns input total minus output total', () => {
    const psbt = makePsbt({
      inputValues: [100_000n, 50_000n],
      outputValues: [140_000n],
    })

    expect(getPsbtFee(psbt)).toBe(10_000n)
  })
})

describe('getPsbtMinVsize', () => {
  it('stays below the real vsize of a standard 1-in 2-out p2wpkh tx (~141 vB)', () => {
    const psbt = makePsbt({
      inputValues: [100_000n],
      outputValues: [50_000n, 40_000n],
    })

    const minVsize = getPsbtMinVsize(psbt)
    expect(minVsize).toBeGreaterThan(100n)
    expect(minVsize).toBeLessThanOrEqual(141n)
  })
})
