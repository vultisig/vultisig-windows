import { Psbt } from 'bitcoinjs-lib'

export function restrictPsbtToInputs(
  psbtBase64: string,
  targetIndexes: number[],
  ourPubkey: Buffer,
  sighashType?: number
) {
  const psbt = Psbt.fromBase64(psbtBase64)

  for (let i = 0; i < psbt.data.inputs.length; i++) {
    const input = psbt.data.inputs[i]

    const isTarget = targetIndexes.includes(i)

    // Remove our keypaths from non-target inputs so WC won’t sign them.
    if (!isTarget) {
      if (input.bip32Derivation) {
        input.bip32Derivation = input.bip32Derivation.filter(
          d => !d.pubkey.equals(ourPubkey)
        )
      }
      if (input.tapBip32Derivation) {
        input.tapBip32Derivation = input.tapBip32Derivation.filter(
          d => !d.pubkey.equals(ourPubkey)
        )
      }
      // If input had ONLY our pubkey paths, it’s fine to leave it empty; WC will skip it.
    } else {
      // enforce a specific sighash like Phantom’s `sigHash`
      if (typeof sighashType === 'number') {
        // bitcoinjs stores it as unsigned 32-bit
        ;(input as any).sighashType = sighashType >>> 0
      }
    }
  }

  return psbt.toBase64()
}
