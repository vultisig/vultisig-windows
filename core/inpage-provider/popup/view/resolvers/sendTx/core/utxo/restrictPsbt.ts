import { Psbt } from 'bitcoinjs-lib'

type InputsToSign = Array<{
  signingIndexes: number[]
  sigHash: number
}>

export const restrictPsbtToInputs = (
  psbt: Psbt,
  entries: InputsToSign,
  ourPubkey: Buffer
): Psbt => {
  const perIndex: Map<number, { sigHash?: number }> = new Map()
  for (const e of entries) {
    for (const idx of e.signingIndexes || []) {
      perIndex.set(idx, { sigHash: e.sigHash })
    }
  }

  psbt.data.inputs.forEach((input, i) => {
    const target = perIndex.get(i)
    const isTarget = !!target

    if (!isTarget) {
      // Strip our keypaths so WalletCore skips
      if (input.bip32Derivation) {
        input.bip32Derivation = input.bip32Derivation.filter(
          d => !d.pubkey.equals(ourPubkey)
        )
      }
      if ((input as any).tapBip32Derivation) {
        ;(input as any).tapBip32Derivation = (
          input as any
        ).tapBip32Derivation.filter((d: any) => !d.pubkey.equals(ourPubkey))
      }
      return
    }

    // Apply per-input sighash if provided
    const sigHash = target.sigHash
    if (typeof sigHash === 'number') {
      const isTaproot =
        !!(input as any).tapInternalKey ||
        (!!(input as any).tapBip32Derivation &&
          (input as any).tapBip32Derivation.length > 0)

      if (sigHash === 0 && !isTaproot) {
        throw new Error(
          `SIGHASH_DEFAULT (0x00) only valid for Taproot input #${i}`
        )
      }

      // If SINGLE, ensure corresponding output exists
      if ((sigHash & 0x03) === 0x03 /* SIGHASH_SINGLE */) {
        if (!psbt.data.outputs || typeof psbt.data.outputs[i] === 'undefined') {
          throw new Error(
            `SIGHASH_SINGLE requires output #${i}, but it is missing`
          )
        }
      }

      ;(input as any).sighashType = sigHash >>> 0
    }
  })

  return psbt
}
