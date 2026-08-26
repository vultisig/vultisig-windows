import { Chain } from '@vultisig/core-chain/Chain'
import {
  AccountCoin,
  accountCoinKeyToString,
} from '@vultisig/core-chain/coin/AccountCoin'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { describe, expect, it } from 'vitest'

import { resolveCoinsTotalBalance } from './resolveCoinsTotalBalance'

const eth: AccountCoin = {
  chain: Chain.Ethereum,
  address: '0xwallet',
  decimals: 18,
  ticker: 'ETH',
}

const btc: AccountCoin = {
  chain: Chain.Bitcoin,
  address: 'bc1wallet',
  decimals: 8,
  ticker: 'BTC',
}

const rune: AccountCoin = {
  chain: Chain.THORChain,
  address: 'thor1wallet',
  decimals: 8,
  ticker: 'RUNE',
}

const coins = [eth, btc, rune]

const prices = {
  [coinKeyToString(eth)]: 2000,
  [coinKeyToString(btc)]: 50000,
  [coinKeyToString(rune)]: 2,
}

const balances = {
  [accountCoinKeyToString(eth)]: 10n ** 18n,
  [accountCoinKeyToString(btc)]: 10n ** 8n,
  [accountCoinKeyToString(rune)]: 10n ** 8n,
}

const rpcError = new Error('RPC unavailable')

describe('resolveCoinsTotalBalance', () => {
  it('sums every resolved coin and marks the total incomplete when one read failed', () => {
    const balancesWithoutRune = { ...balances }
    delete balancesWithoutRune[accountCoinKeyToString(rune)]

    expect(
      resolveCoinsTotalBalance({
        coins,
        prices,
        balances: balancesWithoutRune,
        isPending: false,
        error: rpcError,
      })
    ).toEqual({
      data: 52000,
      isPending: false,
      isUpdating: false,
      isIncomplete: true,
      error: rpcError,
    })
  })

  it('returns a complete total when every coin resolved', () => {
    expect(
      resolveCoinsTotalBalance({
        coins,
        prices,
        balances,
        isPending: false,
        error: null,
      })
    ).toEqual({
      data: 52002,
      isPending: false,
      isUpdating: false,
      isIncomplete: false,
      error: null,
    })
  })

  it('surfaces the error only when nothing resolved after settling', () => {
    expect(
      resolveCoinsTotalBalance({
        coins,
        prices,
        balances: undefined,
        isPending: false,
        error: rpcError,
      })
    ).toEqual({
      data: undefined,
      isPending: false,
      isUpdating: false,
      isIncomplete: false,
      error: rpcError,
    })
  })

  it('stays pending without an error while nothing resolved and reads are in flight', () => {
    expect(
      resolveCoinsTotalBalance({
        coins,
        prices,
        balances: undefined,
        isPending: true,
        error: rpcError,
      })
    ).toEqual({
      data: undefined,
      isPending: true,
      isUpdating: true,
      isIncomplete: false,
      error: null,
    })
  })

  it('keeps updating a partial total while other coins are still loading', () => {
    expect(
      resolveCoinsTotalBalance({
        coins,
        prices,
        balances: { [accountCoinKeyToString(btc)]: 10n ** 8n },
        isPending: true,
        error: null,
      })
    ).toEqual({
      data: 50000,
      isPending: false,
      isUpdating: true,
      isIncomplete: false,
      error: null,
    })
  })

  it('settles to zero when no coin has a price and nothing failed', () => {
    expect(
      resolveCoinsTotalBalance({
        coins,
        prices: {},
        balances,
        isPending: false,
        error: null,
      })
    ).toMatchObject({ data: 0, isPending: false, isIncomplete: false })
  })

  it('resolves to zero for a vault without coins', () => {
    expect(
      resolveCoinsTotalBalance({
        coins: [],
        prices: undefined,
        balances: undefined,
        isPending: false,
        error: null,
      })
    ).toEqual({
      data: 0,
      isPending: false,
      isUpdating: false,
      isIncomplete: false,
      error: null,
    })
  })
})
