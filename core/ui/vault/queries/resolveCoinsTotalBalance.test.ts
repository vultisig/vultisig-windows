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

const balancesOf = (entries: [AccountCoin, bigint][]) =>
  Object.fromEntries(
    entries.map(([coin, amount]) => [accountCoinKeyToString(coin), amount])
  )

const failed = (...failedCoins: AccountCoin[]) =>
  failedCoins.map(coin => accountCoinKeyToString(coin))

const oneEth = 10n ** 18n
const oneBtc = 10n ** 8n
const oneRune = 10n ** 8n

const allBalances = balancesOf([
  [eth, oneEth],
  [btc, oneBtc],
  [rune, oneRune],
])

const rpcError = new Error('RPC unavailable')

describe('resolveCoinsTotalBalance', () => {
  it('sums every resolved coin and marks the total incomplete when one read failed', () => {
    expect(
      resolveCoinsTotalBalance({
        coins,
        prices,
        balances: balancesOf([
          [eth, oneEth],
          [btc, oneBtc],
        ]),
        failedCoins: failed(rune),
        isPricesPending: false,
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

  it('keeps the total incomplete while a failed read is being retried', () => {
    expect(
      resolveCoinsTotalBalance({
        coins,
        prices,
        balances: balancesOf([
          [eth, oneEth],
          [btc, oneBtc],
        ]),
        failedCoins: failed(rune),
        isPricesPending: false,
        error: null,
      })
    ).toEqual({
      data: 52000,
      isPending: false,
      isUpdating: false,
      isIncomplete: true,
      error: expect.any(Error),
    })
  })

  it('shows both updating and incomplete when one coin failed and another is loading', () => {
    expect(
      resolveCoinsTotalBalance({
        coins,
        prices,
        balances: balancesOf([[btc, oneBtc]]),
        failedCoins: failed(rune),
        isPricesPending: false,
        error: null,
      })
    ).toMatchObject({
      data: 50000,
      isPending: false,
      isUpdating: true,
      isIncomplete: true,
    })
  })

  it('returns a complete total when every coin resolved', () => {
    expect(
      resolveCoinsTotalBalance({
        coins,
        prices,
        balances: allBalances,
        failedCoins: [],
        isPricesPending: false,
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

  it('clears the error when every coin still has data after a failed refetch', () => {
    expect(
      resolveCoinsTotalBalance({
        coins,
        prices,
        balances: allBalances,
        failedCoins: [],
        isPricesPending: false,
        error: rpcError,
      })
    ).toEqual({
      data: 52002,
      isPending: false,
      isUpdating: false,
      isIncomplete: false,
      error: null,
    })
  })

  it('surfaces the error only when nothing resolved and every coin failed', () => {
    expect(
      resolveCoinsTotalBalance({
        coins,
        prices,
        balances: undefined,
        failedCoins: failed(eth, btc, rune),
        isPricesPending: false,
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

  it('stays failed rather than pending while every failed coin is retried', () => {
    expect(
      resolveCoinsTotalBalance({
        coins,
        prices,
        balances: undefined,
        failedCoins: failed(eth, btc, rune),
        isPricesPending: false,
        error: null,
      })
    ).toEqual({
      data: undefined,
      isPending: false,
      isUpdating: false,
      isIncomplete: false,
      error: expect.any(Error),
    })
  })

  it('stays pending without an error while nothing resolved and reads are loading', () => {
    expect(
      resolveCoinsTotalBalance({
        coins,
        prices,
        balances: undefined,
        failedCoins: failed(rune),
        isPricesPending: false,
        error: null,
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
        balances: balancesOf([[btc, oneBtc]]),
        failedCoins: [],
        isPricesPending: false,
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

  it('keeps updating while a resolved balance still waits for its price', () => {
    expect(
      resolveCoinsTotalBalance({
        coins: [btc],
        prices: undefined,
        balances: balancesOf([[btc, oneBtc]]),
        failedCoins: [],
        isPricesPending: true,
        error: null,
      })
    ).toEqual({
      data: undefined,
      isPending: true,
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
        balances: allBalances,
        failedCoins: [],
        isPricesPending: false,
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
        failedCoins: [],
        isPricesPending: false,
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
