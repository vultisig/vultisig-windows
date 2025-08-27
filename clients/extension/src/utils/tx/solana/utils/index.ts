import { PublicKey, VersionedTransaction } from '@solana/web3.js'

export const getTransactionAuthority = (inputTx: Uint8Array): string | null => {
  try {
    const txInputDataArray = Object.values(inputTx)
    const txInputDataBuffer = new Uint8Array(txInputDataArray as any)
    const buffer = Buffer.from(txInputDataBuffer)
    const versionedTx = VersionedTransaction.deserialize(buffer)
    const msg = versionedTx.message
    const n = msg.header.numRequiredSignatures
    if (n === 0) return null
    const authorityKey: PublicKey | undefined = msg.staticAccountKeys[0]
    return authorityKey ? authorityKey.toBase58() : null
  } catch {
    return null
  }
}
