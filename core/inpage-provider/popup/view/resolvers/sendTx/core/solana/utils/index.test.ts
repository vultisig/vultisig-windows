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

const tableAccount = (addresses: PublicKey[]) =>
  new AddressLookupTableAccount({
    key: publicKeyFromSeed(1),
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

const connectionThatFails = (): Pick<Connection, 'getAddressLookupTable'> => ({
  getAddressLookupTable: async () => {
    throw new Error('rpc unavailable')
  },
})

const lookup = (
  writableIndexes: number[],
  readonlyIndexes: number[]
): AddressTableLookup => ({
  accountKey: publicKeyFromSeed(1).toBase58(),
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

    const keys = await resolveAddressTableKeys(
      [lookup([2], [0, 1])],
      connectionThatReturns(tableAccount(addresses))
    )

    expect(keys.map(key => key.toBase58())).toEqual([
      addresses[2].toBase58(),
      addresses[0].toBase58(),
      addresses[1].toBase58(),
    ])
  })

  it('fails closed when the lookup table account is missing', async () => {
    await expect(
      resolveAddressTableKeys([lookup([0], [1])], connectionThatReturns(null))
    ).rejects.toThrow()
  })

  it('fails closed when the lookup table fetch errors', async () => {
    await expect(
      resolveAddressTableKeys([lookup([0], [1])], connectionThatFails())
    ).rejects.toThrow()
  })

  it('fails closed when a writable index is outside the fetched table', async () => {
    const table = tableAccount([publicKeyFromSeed(10), publicKeyFromSeed(11)])

    await expect(
      resolveAddressTableKeys([lookup([5], [])], connectionThatReturns(table))
    ).rejects.toThrow()
  })

  it('fails closed when a readonly index is outside the fetched table', async () => {
    const table = tableAccount([publicKeyFromSeed(10), publicKeyFromSeed(11)])

    await expect(
      resolveAddressTableKeys([lookup([], [2])], connectionThatReturns(table))
    ).rejects.toThrow()
  })
})
