import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js'

import { AddressTableLookup } from '../types/types'

export const readU64LE = (buf: Buffer, off: number) => {
  const lo = BigInt(buf.readUInt32LE(off))
  const hi = BigInt(buf.readUInt32LE(off + 4))
  return (hi << 32n) | lo
}

export const resolveAddressTableKeys = async (
  lookups: AddressTableLookup[],
  connection: Connection
): Promise<PublicKey[]> => {
  const out: PublicKey[] = []
  for (const l of lookups ?? []) {
    const res = await connection.getAddressLookupTable(
      new PublicKey(l.accountKey)
    )
    const table = res.value?.state.addresses ?? []
    out.push(
      ...l.writableIndexes.map(i => table[i]),
      ...l.readonlyIndexes.map(i => table[i])
    )
  }
  return out
}
export const mergedKeys = (staticKeys: PublicKey[], loaded: PublicKey[]) => {
  return [...staticKeys, ...loaded]
}

export const getTransactionAuthority = (
  inputTx: Uint8Array
): string | undefined => {
  try {
    const txInputDataArray = Object.values(inputTx)
    const txInputDataBuffer = new Uint8Array(txInputDataArray as any)
    const buffer = Buffer.from(txInputDataBuffer)
    const versionedTx = VersionedTransaction.deserialize(buffer)
    const msg = versionedTx.message
    const n = msg.header.numRequiredSignatures
    if (n === 0) return
    const authorityKey: PublicKey | undefined = msg.staticAccountKeys[0]
    return authorityKey ? authorityKey.toBase58() : undefined
  } catch {
    return undefined
  }
}
