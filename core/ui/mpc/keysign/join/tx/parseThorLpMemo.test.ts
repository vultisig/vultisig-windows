import { describe, expect, it } from 'vitest'

import { parseThorLpMemo } from './parseThorLpMemo'

describe('parseThorLpMemo', () => {
  it('parses an LP add with paired address', () => {
    expect(parseThorLpMemo('+:ETH.USDC:thor1abc')).toEqual({
      kind: 'add',
      pool: 'ETH.USDC',
      pairedAddress: 'thor1abc',
    })
  })

  it('parses an LP add without paired address', () => {
    expect(parseThorLpMemo('+:BTC.BTC')).toEqual({
      kind: 'add',
      pool: 'BTC.BTC',
      pairedAddress: undefined,
    })
  })

  it('parses an LP remove with basis points', () => {
    expect(parseThorLpMemo('-:ETH.USDC:5000')).toEqual({
      kind: 'remove',
      pool: 'ETH.USDC',
      basisPoints: 5000,
    })
  })

  it('returns null for non-LP memos', () => {
    expect(parseThorLpMemo('=:ETH.USDC:0xabc:0/1/0')).toBeNull()
    expect(parseThorLpMemo('SWAP:ETH.USDC:0xabc')).toBeNull()
    expect(parseThorLpMemo('')).toBeNull()
  })

  it('returns null for malformed LP memos', () => {
    expect(parseThorLpMemo('+:')).toBeNull()
    expect(parseThorLpMemo('-:ETH.USDC:not-a-number')).toBeNull()
    expect(parseThorLpMemo('-:ETH.USDC')).toBeNull()
  })
})
