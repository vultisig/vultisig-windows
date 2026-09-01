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

const failed = (...failedCoins: AccountCoin[]) =>
  failedCoins.map(coin => accountCoinKeyToString(coin))

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
  it('keeps every resolved chain when one chain failed to load', () => {
    const result = resolveVaultChainsBalances({
      coins,
      balances: balancesOf([
        [eth, oneEth],
        [usdc, fiveUsdc],
        [btc, oneBtc],
      ]),
      prices,
      failedCoins: failed(rune),
    })

    expect(result.failedChains).toEqual([Chain.THORChain])
    expect(result.loadingChains).toEqual([])
    expect(result.balances.map(({ chain }) => chain)).toEqual([
      Chain.Bitcoin,
      Chain.Ethereum,
    ])
    expect(
      result.balances
        .find(({ chain }) => chain === Chain.Ethereum)
        ?.coins.map(({ ticker, amount, price }) => ({ ticker, amount, price }))
    ).toEqual([
      { ticker: 'ETH', amount: oneEth, price: 2000 },
      { ticker: 'USDC', amount: fiveUsdc, price: 1 },
    ])
  })

  it('reports a chain without a balance or a failure as loading', () => {
    const result = resolveVaultChainsBalances({
      coins,
      balances: balancesOf([
        [eth, oneEth],
        [usdc, fiveUsdc],
        [btc, oneBtc],
      ]),
      prices,
      failedCoins: [],
    })

    expect(result.loadingChains).toEqual([Chain.THORChain])
    expect(result.failedChains).toEqual([])
    expect(result.balances.map(({ chain }) => chain)).toEqual([
      Chain.Bitcoin,
      Chain.Ethereum,
    ])
  })

  it('fails a chain when any of its coins failed', () => {
    const result = resolveVaultChainsBalances({
      coins,
      balances: balancesOf([
        [eth, oneEth],
        [btc, oneBtc],
        [rune, oneRune],
      ]),
      prices,
      failedCoins: failed(usdc),
    })

    expect(result.failedChains).toEqual([Chain.Ethereum])
    expect(result.balances.map(({ chain }) => chain)).toEqual([
      Chain.Bitcoin,
      Chain.THORChain,
    ])
  })

  it('fails a chain that has both a failed and a loading coin', () => {
    const result = resolveVaultChainsBalances({
      coins,
      balances: balancesOf([
        [btc, oneBtc],
        [rune, oneRune],
      ]),
      prices,
      failedCoins: failed(eth),
    })

    expect(result.failedChains).toEqual([Chain.Ethereum])
    expect(result.loadingChains).toEqual([])
  })

  it('resolves a chain once its balance arrives even after earlier failures', () => {
    const result = resolveVaultChainsBalances({
      coins: [rune],
      balances: balancesOf([[rune, oneRune]]),
      prices,
      failedCoins: failed(rune),
    })

    expect(result).toEqual({
      balances: [
        {
          chain: Chain.THORChain,
          coins: [{ ...rune, amount: oneRune, price: 2 }],
        },
      ],
      loadingChains: [],
      failedChains: [],
    })
  })

  it('reports every chain as failed when nothing resolved', () => {
    expect(
      resolveVaultChainsBalances({
        coins,
        balances: undefined,
        prices,
        failedCoins: failed(eth, usdc, btc, rune),
      })
    ).toEqual({
      balances: [],
      loadingChains: [],
      failedChains: [Chain.Ethereum, Chain.Bitcoin, Chain.THORChain],
    })
  })

  it('falls back to a zero price without failing the chain', () => {
    expect(
      resolveVaultChainsBalances({
        coins: [btc],
        balances: balancesOf([[btc, oneBtc]]),
        prices: undefined,
        failedCoins: [],
      })
    ).toEqual({
      balances: [
        {
          chain: Chain.Bitcoin,
          coins: [{ ...btc, amount: oneBtc, price: 0 }],
        },
      ],
      loadingChains: [],
      failedChains: [],
    })
  })

  it('returns empty results for a vault without coins', () => {
    expect(
      resolveVaultChainsBalances({
        coins: [],
        balances: {},
        prices: {},
        failedCoins: [],
      })
    ).toEqual({ balances: [], loadingChains: [], failedChains: [] })
  })
})
