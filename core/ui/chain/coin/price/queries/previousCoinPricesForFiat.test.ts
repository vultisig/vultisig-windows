import { QueryClient } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { describe, expect, it } from 'vitest'

import {
  cachedCoinPricesForFiat,
  keptPriceMaxAge,
  previousCoinPricesForFiat,
} from './previousCoinPricesForFiat'
import { getCoinPricesQueryKeys } from './useCoinPricesQuery'

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

  it('reads a legacy number map using the entry time as the fetch time', () => {
    const prices = previousCoinPricesForFiat(
      [{ fiatCurrency: 'usd', updatedAt: 50, prices: { [cake]: 1.96 } }],
      'usd',
      50
    )

    expect(prices[cake]).toEqual({ price: 1.96, fetchedAt: 50 })
  })
})

describe('cachedCoinPricesForFiat', () => {
  it('reads a price stored under an older coin set', () => {
    const client = new QueryClient()
    const coin = { chain: Chain.Ethereum, id: '0xcake' }
    client.setQueryData(
      getCoinPricesQueryKeys({ coins: [coin], fiatCurrency: 'usd' }),
      { [cake]: 1.96 }
    )
    client.setQueryData(
      getCoinPricesQueryKeys({ coins: [coin], fiatCurrency: 'eur' }),
      { [cake]: 9 }
    )

    const usd = cachedCoinPricesForFiat(client, 'usd')[cake]
    const eur = cachedCoinPricesForFiat(client, 'eur')[cake]
    expect(usd?.price).toBe(1.96)
    expect(eur?.price).toBe(9)
    expect(Date.now() - (usd?.fetchedAt ?? 0)).toBeLessThan(keptPriceMaxAge)
  })
})
