import { TW } from '@trustwallet/wallet-core'
import { Psbt } from 'bitcoinjs-lib'


export const getCompiledTxFromPsbt = (
  psbtBase64: string,
  fallbackPubkey?: Uint8Array
): Uint8Array => {
  const psbt = Psbt.fromBuffer(Buffer.from(psbtBase64, 'base64'))

  for (let i = 0; i < psbt.data.inputs.length; i++) {
    const input = psbt.data.inputs[i]
    const pubkey =
      input.bip32Derivation?.[0]?.pubkey ??
      input.partialSig?.[0]?.pubkey ??
      (fallbackPubkey ? Buffer.from(fallbackPubkey) : undefined)
    if (!pubkey) continue

    if (!input.partialSig || input.partialSig.length === 0) {
      const placeholderSig = createPlaceholderDerSignature()
      psbt.updateInput(i, {
        partialSig: [
          { pubkey: Buffer.from(pubkey), signature: placeholderSig },
        ],
      })
    }
  }

  psbt.finalizeAllInputs()
  const tx = psbt.extractTransaction(true)
  const txBuffer = Buffer.from(tx.toBuffer())

  const signingOutput = TW.Bitcoin.Proto.SigningOutput.create({
    encoded: new Uint8Array(txBuffer),
  })
  return TW.Bitcoin.Proto.SigningOutput.encode(signingOutput).finish()
}

const createPlaceholderDerSignature = (): Buffer => {
  const r = Buffer.alloc(31, 0)
  const s = Buffer.alloc(32, 0)
  const rPart = Buffer.concat([Buffer.from([0x02, 0x1f]), r])
  const sPart = Buffer.concat([Buffer.from([0x02, 0x20]), s])
  const seqContent = Buffer.concat([rPart, sPart, Buffer.from([0x01])])
  return Buffer.concat([Buffer.from([0x30, seqContent.length]), seqContent])
}
