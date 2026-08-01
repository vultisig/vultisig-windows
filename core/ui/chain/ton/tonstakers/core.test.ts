import { Address, Cell } from '@ton/core'
import { describe, expect, it } from 'vitest'

import {
  buildTonstakersBurnCell,
  buildTonstakersDepositCell,
  tonCellToCanonicalHex,
  tonstakersBurnOpcode,
  tonstakersDepositOpcode,
} from './core'

const depositVector = 'b5ee9c7201010101000e00001847d543910000000000000000'

describe('Tonstakers message bodies', () => {
  it('reproduces the canonical deposit BoC', () => {
    const body = buildTonstakersDepositCell()

    expect(tonCellToCanonicalHex(body)).toBe(depositVector)

    const slice = Cell.fromBoc(
      Buffer.from(depositVector, 'hex')
    )[0].beginParse()
    expect(slice.loadUint(32)).toBe(tonstakersDepositOpcode)
    expect(slice.loadUintBig(64)).toBe(0n)
    expect(slice.remainingBits).toBe(0)
    expect(slice.remainingRefs).toBe(0)
  })

  it('round-trips a burn body with the amount, response address, and Tonstakers flags', () => {
    const amount = 12_345_678_901n
    const responseAddress =
      '0:1111111111111111111111111111111111111111111111111111111111111111'
    const body = buildTonstakersBurnCell({ amount, responseAddress })
    const decoded = Cell.fromBoc(
      Buffer.from(tonCellToCanonicalHex(body), 'hex')
    )[0].beginParse()

    expect(decoded.loadUint(32)).toBe(tonstakersBurnOpcode)
    expect(decoded.loadUintBig(64)).toBe(0n)
    expect(decoded.loadCoins()).toBe(amount)
    expect(decoded.loadAddress().equals(Address.parse(responseAddress))).toBe(
      true
    )

    const customPayload = decoded.loadMaybeRef()
    expect(customPayload).not.toBeNull()
    const options = customPayload?.beginParse()
    expect(options?.loadBit()).toBe(false)
    expect(options?.loadBit()).toBe(false)
    expect(options?.remainingBits).toBe(0)
    expect(decoded.remainingBits).toBe(0)
    expect(decoded.remainingRefs).toBe(0)
  })

  it('rejects a zero burn before a mainnet payload can be built', () => {
    expect(() =>
      buildTonstakersBurnCell({
        amount: 0n,
        responseAddress:
          '0:1111111111111111111111111111111111111111111111111111111111111111',
      })
    ).toThrow('Tonstakers burn amount must be positive')
  })
})
