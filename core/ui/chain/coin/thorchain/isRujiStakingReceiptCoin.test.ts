import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import {
  isRujiStakingReceiptCoin,
  withoutRujiStakingReceiptCoins,
} from './isRujiStakingReceiptCoin'

describe('isRujiStakingReceiptCoin', () => {
  it('returns true for known RUJI staking receipt denoms on THORChain', () => {
    expect(
      isRujiStakingReceiptCoin({
        chain: Chain.THORChain,
        id: 'x/staking-x/ruji',
        ticker: 'sRUJI',
      })
    ).toBe(true)
    expect(
      isRujiStakingReceiptCoin({
        chain: Chain.THORChain,
        id: 'x/staking-ruji',
        ticker: 'RUJI',
      })
    ).toBe(true)
    expect(
      isRujiStakingReceiptCoin({
        chain: Chain.THORChain,
        id: 'X/STAKING-RUJI',
        ticker: 'x',
      })
    ).toBe(true)
  })

  it('returns true when ticker is sRUJI even if id is missing', () => {
    expect(
      isRujiStakingReceiptCoin({
        chain: Chain.THORChain,
        id: undefined,
        ticker: 'sRUJI',
      })
    ).toBe(true)
  })

  it('returns false for liquid RUJI and other chains', () => {
    expect(
      isRujiStakingReceiptCoin({
        chain: Chain.THORChain,
        id: 'x/ruji',
        ticker: 'RUJI',
      })
    ).toBe(false)
    expect(
      isRujiStakingReceiptCoin({
        chain: Chain.Ethereum,
        id: 'x/staking-ruji',
        ticker: 'sRUJI',
      })
    ).toBe(false)
  })
})

describe('withoutRujiStakingReceiptCoins', () => {
  it('returns the same array instance when no receipt is present', () => {
    const input = [
      {
        chain: Chain.THORChain,
        id: 'x/ruji',
        ticker: 'RUJI',
      },
    ]
    expect(withoutRujiStakingReceiptCoins(input)).toBe(input)
  })

  it('removes only RUJI staking receipt entries', () => {
    const liquid = {
      chain: Chain.THORChain,
      id: 'x/ruji',
      ticker: 'RUJI',
    }
    const receipt = {
      chain: Chain.THORChain,
      id: 'x/staking-x/ruji',
      ticker: 'sRUJI',
    }
    expect(withoutRujiStakingReceiptCoins([liquid, receipt])).toEqual([liquid])
  })
})
