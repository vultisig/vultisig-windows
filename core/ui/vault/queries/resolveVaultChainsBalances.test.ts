import { Chain } from '@vultisig/core-chain/Chain'
import {
  AccountCoin,
  accountCoinKeyToString,
} from '@vultisig/core-chain/coin/AccountCoin'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { describe, expect, it } from 'vitest'

import { resolveVaultChainsBalances } from './resolveVaultChainsBalances'

const eth: AccountCoin = {
  chain: Chain.Ethereum,
  address: '0xwallet',
  decimals: 18,
  ticker: 'ETH',
}

const usdc: AccountCoin = {
  chain: Chain.Ethereum,
  id: '0xusdc',
  address: '0xwallet',
  decimals: 6,
  ticker: 'USDC',
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

const coins = [eth, usdc, btc, rune]

const balancesOf = (entries: [AccountCoin, bigint][]) =>
  Object.fromEntries(
    entries.map(([coin, amount]) => [accountCoinKeyToString(coin), amount])
  )

const prices = {
  [coinKeyToString(eth)]: 2000,
  [coinKeyToString(usdc)]: 1,
  [coinKeyToString(btc)]: 50000,
  [coinKeyToString(rune)]: 2,
}

const oneEth = 10n ** 18n
const fiveUsdc = 5n * 10n ** 6n
const oneBtc = 10n ** 8n
const oneRune = 10n ** 8n

describe('resolveVaultChainsBalances', () => {
  it('keeps every resolved chain when one chain settled without a balance', () => {
    const result = resolveVaultChainsBalances({
      coins,
      balances: balancesOf([
        [eth, oneEth],
        [usdc, fiveUsdc],
        [btc, oneBtc],
      ]),
      prices,
      isBalancesPending: false,
    })

    expect(result?.failedChains).toEqual([Chain.THORChain])
    expect(result?.balances.map(({ chain }) => chain)).toEqual([
      Chain.Bitcoin,
      Chain.Ethereum,
    ])
    expect(
      result?.balances
        .find(({ chain }) => chain === Chain.Ethereum)
        ?.coins.map(({ ticker, amount, price }) => ({ ticker, amount, price }))
    ).toEqual([
      { ticker: 'ETH', amount: oneEth, price: 2000 },
      { ticker: 'USDC', amount: fiveUsdc, price: 1 },
    ])
  })

  it('returns undefined while an unresolved chain is still loading', () => {
    expect(
      resolveVaultChainsBalances({
        coins,
        balances: balancesOf([
          [eth, oneEth],
          [usdc, fiveUsdc],
          [btc, oneBtc],
        ]),
        prices,
        isBalancesPending: true,
      })
    ).toBeUndefined()
  })

  it('resolves every chain once all balances are present even while reads are pending', () => {
    const result = resolveVaultChainsBalances({
      coins,
      balances: balancesOf([
        [eth, oneEth],
        [usdc, fiveUsdc],
        [btc, oneBtc],
        [rune, oneRune],
      ]),
      prices,
      isBalancesPending: true,
    })

    expect(result?.failedChains).toEqual([])
    expect(result?.balances.map(({ chain }) => chain)).toEqual([
      Chain.Bitcoin,
      Chain.Ethereum,
      Chain.THORChain,
    ])
  })

  it('fails a chain when any of its coins is unresolved', () => {
    const result = resolveVaultChainsBalances({
      coins,
      balances: balancesOf([
        [eth, oneEth],
        [btc, oneBtc],
        [rune, oneRune],
      ]),
      prices,
      isBalancesPending: false,
    })

    expect(result?.failedChains).toEqual([Chain.Ethereum])
    expect(result?.balances.map(({ chain }) => chain)).toEqual([
      Chain.Bitcoin,
      Chain.THORChain,
    ])
  })

  it('reports every chain as failed when nothing resolved after settling', () => {
    expect(
      resolveVaultChainsBalances({
        coins,
        balances: undefined,
        prices,
        isBalancesPending: false,
      })
    ).toEqual({
      balances: [],
      failedChains: [Chain.Ethereum, Chain.Bitcoin, Chain.THORChain],
    })
  })

  it('falls back to a zero price without failing the chain', () => {
    expect(
      resolveVaultChainsBalances({
        coins: [btc],
        balances: balancesOf([[btc, oneBtc]]),
        prices: undefined,
        isBalancesPending: false,
      })
    ).toEqual({
      balances: [
        {
          chain: Chain.Bitcoin,
          coins: [{ ...btc, amount: oneBtc, price: 0 }],
        },
      ],
      failedChains: [],
    })
  })

  it('returns empty results for a vault without coins', () => {
    expect(
      resolveVaultChainsBalances({
        coins: [],
        balances: {},
        prices: {},
        isBalancesPending: false,
      })
    ).toEqual({ balances: [], failedChains: [] })
  })
})
