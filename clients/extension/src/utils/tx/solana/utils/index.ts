import { Connection, PublicKey } from '@solana/web3.js'

import { AddressTableLookup } from '../types/types'

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
