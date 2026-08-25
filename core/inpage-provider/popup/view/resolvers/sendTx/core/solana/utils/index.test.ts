import {
  AddressLookupTableAccount,
  Connection,
  PublicKey,
} from '@solana/web3.js'
import { describe, expect, it } from 'vitest'

import { AddressTableLookup } from '../types/types'
import { resolveAddressTableKeys } from '.'

const publicKeyFromSeed = (seed: number) =>
  new PublicKey(new Uint8Array(32).fill(seed))

const tableAccount = (addresses: PublicKey[], keySeed = 1) =>
  new AddressLookupTableAccount({
    key: publicKeyFromSeed(keySeed),
    state: {
      deactivationSlot: BigInt(0),
      lastExtendedSlot: 0,
      lastExtendedSlotStartIndex: 0,
      addresses,
    },
  })

const connectionThatReturns = (
  value: AddressLookupTableAccount | null
): Pick<Connection, 'getAddressLookupTable'> => ({
  getAddressLookupTable: async () => ({ context: { slot: 0 }, value }),
})

const connectionThatServes = (
  tables: Record<string, AddressLookupTableAccount>
): Pick<Connection, 'getAddressLookupTable'> => ({
  getAddressLookupTable: async key => ({
    context: { slot: 0 },
    value: tables[key.toBase58()] ?? null,
  }),
})

const connectionThatFails = (): Pick<Connection, 'getAddressLookupTable'> => ({
  getAddressLookupTable: async () => {
    throw new Error('rpc unavailable')
  },
})

const lookup = (
  writableIndexes: number[],
  readonlyIndexes: number[],
  tableSeed = 1
): AddressTableLookup => ({
  accountKey: publicKeyFromSeed(tableSeed).toBase58(),
  writableIndexes,
  readonlyIndexes,
})

describe('resolveAddressTableKeys', () => {
  it('resolves writable indexes before readonly ones', async () => {
    const addresses = [
      publicKeyFromSeed(10),
      publicKeyFromSeed(11),
      publicKeyFromSeed(12),
    ]

    const keys = await resolveAddressTableKeys({
      lookups: [lookup([2], [0, 1])],
      connection: connectionThatReturns(tableAccount(addresses)),
    })

    expect(keys.map(key => key.toBase58())).toEqual([
      addresses[2].toBase58(),
      addresses[0].toBase58(),
      addresses[1].toBase58(),
    ])
  })

  it('fails closed when the lookup table account is missing', async () => {
    await expect(
      resolveAddressTableKeys({
        lookups: [lookup([0], [1])],
        connection: connectionThatReturns(null),
      })
    ).rejects.toThrow()
  })

  it('fails closed when the lookup table fetch errors', async () => {
    await expect(
      resolveAddressTableKeys({
        lookups: [lookup([0], [1])],
        connection: connectionThatFails(),
      })
    ).rejects.toThrow()
  })

  it('fails closed when a writable index is outside the fetched table', async () => {
    const table = tableAccount([publicKeyFromSeed(10), publicKeyFromSeed(11)])

    await expect(
      resolveAddressTableKeys({
        lookups: [lookup([5], [])],
        connection: connectionThatReturns(table),
      })
    ).rejects.toThrow()
  })

  it('fails closed when a readonly index is outside the fetched table', async () => {
    const table = tableAccount([publicKeyFromSeed(10), publicKeyFromSeed(11)])

    await expect(
      resolveAddressTableKeys({
        lookups: [lookup([], [2])],
        connection: connectionThatReturns(table),
      })
    ).rejects.toThrow()
  })

  it('orders every writable entry before any readonly entry across tables', async () => {
    const firstTable = tableAccount(
      [publicKeyFromSeed(10), publicKeyFromSeed(11)],
      1
    )
    const secondTable = tableAccount(
      [publicKeyFromSeed(20), publicKeyFromSeed(21)],
      2
    )

    const keys = await resolveAddressTableKeys({
      lookups: [lookup([0], [1], 1), lookup([0], [1], 2)],
      connection: connectionThatServes({
        [firstTable.key.toBase58()]: firstTable,
        [secondTable.key.toBase58()]: secondTable,
      }),
    })

    expect(keys.map(key => key.toBase58())).toEqual([
      publicKeyFromSeed(10).toBase58(),
      publicKeyFromSeed(20).toBase58(),
      publicKeyFromSeed(11).toBase58(),
      publicKeyFromSeed(21).toBase58(),
    ])
  })
})
