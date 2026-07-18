import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import {
  isBondedRuneReceiptCoin,
  withoutBondedRuneReceiptCoins,
} from './isBondedRuneReceiptCoin'

describe('isBondedRuneReceiptCoin', () => {
  it('returns true for the ybRUNE staking receipt denom on THORChain', () => {
    expect(
      isBondedRuneReceiptCoin({
        chain: Chain.THORChain,
        id: 'x/staking-x/brune',
        ticker: 'ybRUNE',
      })
    ).toBe(true)
    expect(
      isBondedRuneReceiptCoin({
        chain: Chain.THORChain,
        id: 'X/STAKING-X/BRUNE',
        ticker: 'x',
      })
    ).toBe(true)
  })

  it('returns true when ticker is ybRUNE even if id is missing', () => {
    expect(
      isBondedRuneReceiptCoin({
        chain: Chain.THORChain,
        id: undefined,
        ticker: 'ybRUNE',
      })
    ).toBe(true)
  })

  it('returns false for liquid bRUNE and other chains', () => {
    expect(
      isBondedRuneReceiptCoin({
        chain: Chain.THORChain,
        id: 'x/brune',
        ticker: 'bRUNE',
      })
    ).toBe(false)
    expect(
      isBondedRuneReceiptCoin({
        chain: Chain.Ethereum,
        id: 'x/staking-x/brune',
        ticker: 'ybRUNE',
      })
    ).toBe(false)
  })
})

describe('withoutBondedRuneReceiptCoins', () => {
  it('returns the same array instance when no receipt is present', () => {
    const input = [
      {
        chain: Chain.THORChain,
        id: 'x/brune',
        ticker: 'bRUNE',
      },
    ]
    expect(withoutBondedRuneReceiptCoins(input)).toBe(input)
  })

  it('removes only ybRUNE receipt entries', () => {
    const liquid = {
      chain: Chain.THORChain,
      id: 'x/brune',
      ticker: 'bRUNE',
    }
    const receipt = {
      chain: Chain.THORChain,
      id: 'x/staking-x/brune',
      ticker: 'ybRUNE',
    }
    expect(withoutBondedRuneReceiptCoins([liquid, receipt])).toEqual([liquid])
  })
})
