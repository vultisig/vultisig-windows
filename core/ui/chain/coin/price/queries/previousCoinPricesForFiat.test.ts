import { QueryClient } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { describe, expect, it } from 'vitest'

import {
  cachedCoinPricesForFiat,
  keptPriceMaxAge,
  previousCoinPricesForFiat,
} from './previousCoinPricesForFiat'
const cake = coinKeyToString({ chain: Chain.Ethereum, id: '0xcake' })

describe('previousCoinPricesForFiat', () => {
  it('keeps the newest stamp for the requested fiat', () => {
    const prices = previousCoinPricesForFiat(
      [
        {
          fiatCurrency: 'usd',
          updatedAt: 1,
          prices: { [cake]: { price: 1.96, fetchedAt: 1 } },
        },
        {
          fiatCurrency: 'usd',
          updatedAt: 2,
          prices: { [cake]: { price: 2.8, fetchedAt: 2 } },
        },
        {
          fiatCurrency: 'eur',
          updatedAt: 3,
          prices: { [cake]: { price: 9, fetchedAt: 3 } },
        },
      ],
      'usd',
      3
    )

    expect(prices[cake]).toEqual({ price: 2.8, fetchedAt: 2 })
  })

  it('drops a stamp older than an hour even when the entry was just written', () => {
    const now = 10_000_000
    const prices = previousCoinPricesForFiat(
      [
        {
          fiatCurrency: 'usd',
          updatedAt: now,
          prices: {
            [cake]: { price: 1.96, fetchedAt: now - keptPriceMaxAge - 1 },
          },
        },
      ],
      'usd',
      now
    )

    expect(prices[cake]).toBeUndefined()
  })
})

describe('cachedCoinPricesForFiat', () => {
  it('reads a price stored under an older coin set', () => {
    const client = new QueryClient()
    const coin = { chain: Chain.Ethereum, id: '0xcake' }
    client.setQueryData(
      ['erc20Prices', { coins: [coin], fiatCurrency: 'usd' }],
      {
        [cake]: { price: 1.96, fetchedAt: 10 },
      }
    )
    client.setQueryData(
      ['erc20Prices', { coins: [coin], fiatCurrency: 'eur' }],
      {
        [cake]: { price: 9, fetchedAt: 10 },
      }
    )

    expect(cachedCoinPricesForFiat(client, 'usd', 10)[cake]).toEqual({
      price: 1.96,
      fetchedAt: 10,
    })
    expect(cachedCoinPricesForFiat(client, 'eur', 10)[cake]).toEqual({
      price: 9,
      fetchedAt: 10,
    })
  })
})
