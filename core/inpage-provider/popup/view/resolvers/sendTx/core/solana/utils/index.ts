import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js'

import { AddressTableLookup } from '../types/types'

export const readU64LE = (buf: Buffer, off: number) => {
  const lo = BigInt(buf.readUInt32LE(off))
  const hi = BigInt(buf.readUInt32LE(off + 4))
  return (hi << 32n) | lo
}

/** The slice of `Connection` needed to read address lookup tables. */
type AddressLookupTableReader = Pick<Connection, 'getAddressLookupTable'>

type ResolveAddressTableKeysInput = {
  lookups: AddressTableLookup[]
  connection: AddressLookupTableReader
}

/**
 * Resolves the account keys a v0 transaction loads from on-chain address
 * lookup tables. Every table is fetched concurrently, but writable entries
 * from all tables still come before readonly ones, matching how Solana orders
 * loaded addresses. Fails closed: an unreadable table or an index outside it
 * throws instead of yielding undefined keys, so callers can never present a
 * partially decoded transaction as a complete one.
 */
export const resolveAddressTableKeys = async ({
  lookups,
  connection,
}: ResolveAddressTableKeysInput): Promise<PublicKey[]> => {
  const resolved = await Promise.all(
    lookups.map(async lookup => {
      const { value } = await connection.getAddressLookupTable(
        new PublicKey(lookup.accountKey)
      )
      if (!value) {
        throw new Error(
          `Address lookup table ${lookup.accountKey} could not be read`
        )
      }

      const { addresses } = value.state
      const resolveIndex = (index: number) => {
        const address = addresses[index]
        if (!address) {
          throw new Error(
            `Address lookup table ${lookup.accountKey} has no entry at index ${index}`
          )
        }
        return address
      }

      return {
        writable: lookup.writableIndexes.map(resolveIndex),
        readonly: lookup.readonlyIndexes.map(resolveIndex),
      }
    })
  )

  return [
    ...resolved.flatMap(({ writable }) => writable),
    ...resolved.flatMap(({ readonly }) => readonly),
  ]
}

/**
 * Reads the account a transaction addresses by index, against the merged
 * static-plus-lookup key list. Throws rather than returning undefined, since
 * an index past the resolved keys means the transaction was only partially
 * decoded and any account read from it would be a guess.
 */
export const accountKeyAt = (keys: PublicKey[], index: number): PublicKey => {
  const key = keys[index]
  if (!key) {
    throw new Error(
      `Transaction references account index ${index}, outside the ${keys.length} resolved account keys`
    )
  }
  return key
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
