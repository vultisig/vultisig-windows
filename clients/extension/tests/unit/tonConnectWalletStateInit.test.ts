/**
 * A TON Connect `connect` / `restoreConnection` reply carries both the account
 * address and its `walletStateInit`. A dApp verifying `ton_proof` hashes the
 * state init and rejects the session unless it derives the address sitting next
 * to it, so the two must never be decided independently — a vault on W5 used to
 * advertise its W5 address with V4R2 state.
 */
import { Address, Cell, contractAddress } from '@ton/core'
import { describe, expect, it } from 'vitest'

import { getWalletStateInit } from '../../src/inpage/providers/tonConnect/getWalletStateInit'

const publicKeyHex = 'aa'.repeat(32)

// The two contracts the same key derives, as WalletCore derives them.
const v4r2Address = 'UQCf6aQfV3vc8KLtPI_lROY64hUeR1oyNfdbwXB-gwDaKZmi'
const w5Address = 'UQCvaZohosTA0ak9ZFMs-cvL1JrXqogqJH8sI2uO6k8clJpn'

type AddressOfStateInitInput = {
  stateInit: string
  workchain: number
}

/** What a dApp does with the reply: hash the state init back into an address. */
const addressOfStateInit = ({
  stateInit,
  workchain,
}: AddressOfStateInitInput) => {
  const slice = Cell.fromBase64(stateInit).beginParse()
  slice.loadBit() // split_depth
  slice.loadBit() // special
  slice.loadBit() // has code
  const code = slice.loadRef()
  slice.loadBit() // has data
  const data = slice.loadRef()

  return contractAddress(workchain, { code, data })
}

describe('getWalletStateInit', () => {
  it.each([
    { version: 'v4r2', address: v4r2Address },
    { version: 'v5r1', address: w5Address },
  ])(
    'derives $version state init that hashes back to the advertised address',
    ({ address }) => {
      const parsed = Address.parse(address)

      const stateInit = getWalletStateInit({ publicKeyHex, address: parsed })

      expect(
        addressOfStateInit({ stateInit, workchain: parsed.workChain }).equals(
          parsed
        )
      ).toBe(true)
    }
  )

  it('gives the two contracts different state init, so the reply cannot be reused across them', () => {
    const v4r2 = getWalletStateInit({
      publicKeyHex,
      address: Address.parse(v4r2Address),
    })
    const w5 = getWalletStateInit({
      publicKeyHex,
      address: Address.parse(w5Address),
    })

    expect(v4r2).not.toBe(w5)
  })

  it('refuses an address the key does not derive, rather than answering with the wrong contract', () => {
    const strangerAddress = Address.parse(
      '0:e62deead89c718fee2d9b1fbab75838db2136e0a7f084bcd4a709f29e8ce8848'
    )

    expect(() =>
      getWalletStateInit({ publicKeyHex, address: strangerAddress })
    ).toThrow('No supported TON wallet contract derives')
  })
})
