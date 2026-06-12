import { bigIntSum } from '@vultisig/lib-utils/bigint/bigIntSum'
import { Psbt, Transaction } from 'bitcoinjs-lib'

/** 8-byte value + 1-byte script length varint (scripts < 253 bytes). */
const outputBaseSize = 9n
const txOverheadVsize = 11n
/** P2TR key-path spend — the smallest standard input, so vsize stays a lower bound. */
const minInputVsize = 57n

export const getPsbtOutputSizes = (psbt: Psbt): bigint[] =>
  psbt.txOutputs.map(({ script }) => outputBaseSize + BigInt(script.length))

/**
 * Total network fee a PSBT pays: sum(input values) - sum(output values).
 * Returns null when an input lacks UTXO data, leaving validation to the
 * signing layer which rejects such inputs anyway.
 */
export const getPsbtFee = (psbt: Psbt): bigint | null => {
  let inputsTotal = 0n

  for (const [index, input] of psbt.data.inputs.entries()) {
    if (input.witnessUtxo) {
      inputsTotal += BigInt(input.witnessUtxo.value)
      continue
    }

    if (!input.nonWitnessUtxo) return null

    const prevTx = Transaction.fromBuffer(input.nonWitnessUtxo)
    const prevOut = prevTx.outs[psbt.txInputs[index]?.index ?? -1]
    if (!prevOut) return null

    inputsTotal += BigInt(prevOut.value)
  }

  const outputsTotal = psbt.txOutputs.reduce(
    (sum, { value }) => sum + BigInt(value),
    0n
  )

  return inputsTotal - outputsTotal
}

/**
 * Lower-bound vsize of the finalized tx, assuming the cheapest standard
 * input type. Underestimating keeps the min-fee check free of false
 * positives: we only flag fees no input composition could justify.
 */
export const getPsbtMinVsize = (psbt: Psbt): bigint =>
  txOverheadVsize +
  BigInt(psbt.txInputs.length) * minInputVsize +
  bigIntSum(getPsbtOutputSizes(psbt))
