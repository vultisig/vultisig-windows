import { VersionedTransaction } from '@solana/web3.js'
import { Psbt } from 'bitcoinjs-lib'

export const isPopupView = () => {
  return chrome?.extension?.getViews({ type: 'popup' }).length > 0
}

export function isVersionedTransaction(tx: any): tx is VersionedTransaction {
  return (
    typeof tx === 'object' &&
    'version' in tx &&
    typeof tx.version === 'number' &&
    'message' in tx &&
    'addressTableLookups' in tx.message
  )
}

export const bytesEqual = (a: Uint8Array, b: Uint8Array): boolean => {
  return arraysEqual(a, b)
}

type Indexed<T> = {
  length: number
  [index: number]: T
}

const arraysEqual = <T>(a: Indexed<T>, b: Indexed<T>): boolean => {
  if (a === b) return true

  const length = a.length
  if (length !== b.length) return false

  for (let i = 0; i < length; i++) {
    if (a[i] !== b[i]) return false
  }

  return true
}

function unfinalizeInput(psbt: Psbt, i: number) {
  const inp = psbt.data.inputs[i]
  if ('finalScriptSig' in inp) delete (inp as any).finalScriptSig
  if ('finalScriptWitness' in inp) delete (inp as any).finalScriptWitness
}
export function rebuildPsbtWithPartialSigsFromWC(
  wcData: any,
  originalPsbtBytes: Buffer
): Buffer {
  const sr = wcData?.signingResultV2
  if (!sr) throw new Error('Missing signingResultV2')

  const coreTx = sr.bitcoin
  if (!coreTx?.inputs || !Array.isArray(coreTx.inputs)) {
    throw new Error('WalletCore result missing bitcoin.inputs')
  }

  const psbt = Psbt.fromBuffer(Buffer.from(originalPsbtBytes))

  coreTx.inputs.forEach((inp: any, i: number) => {
    const wit = inp.witnessItems as string[] | undefined
    if (!wit || wit.length === 0) return

    // P2WPKH: [DER+1B sighash, 33B pubkey]
    // Taproot key path: [64/65B sig] (no pubkey item)
    const sig = Buffer.from(wit[0], 'base64')
    const pub = wit[1] ? Buffer.from(wit[1], 'base64') : undefined

    // Ensure we are NOT finalized
    unfinalizeInput(psbt, i)

    if (pub && (pub.length === 33 || pub.length === 65)) {
      // SegWit v0 (P2WPKH / maybe P2WSH)
      // Put partialSig (DER+hashType) — do NOT set final* fields
      psbt.updateInput(i, {
        partialSig: [{ pubkey: pub, signature: sig }],
      })
    } else {
      // Taproot key-path (pubkey not in witness stack)
      // Put Schnorr sig into tapKeySig (PSBTv2 key-path sig)
      psbt.updateInput(i, {
        tapKeySig: sig,
      } as any)
    }
  })

  return psbt.toBuffer()
}
