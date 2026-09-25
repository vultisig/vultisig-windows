import { QueryClient } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { describe, expect, it } from 'vitest'

import {
  cachedCoinPricesForFiat,
  previousCoinPricesForFiat,
} from './previousCoinPricesForFiat'
import { getCoinPricesQueryKeys } from './useCoinPricesQuery'

const cake = coinKeyToString({ chain: Chain.Ethereum, id: '0xcake' })

describe('previousCoinPricesForFiat', () => {
  it('keeps the newest positive price for the requested fiat', () => {
    const prices = previousCoinPricesForFiat(
      [
        { fiatCurrency: 'usd', updatedAt: 1, prices: { [cake]: 1.96 } },
        { fiatCurrency: 'usd', updatedAt: 2, prices: { [cake]: 2.8 } },
        { fiatCurrency: 'eur', updatedAt: 3, prices: { [cake]: 9 } },
      ],
      'usd'
    )

    expect(prices[cake]).toBe(2.8)
  })

  it('does not let a later missing-price fill erase a real quote', () => {
    const prices = previousCoinPricesForFiat(
      [
        { fiatCurrency: 'usd', updatedAt: 1, prices: { [cake]: 1.96 } },
        { fiatCurrency: 'usd', updatedAt: 2, prices: { [cake]: 0 } },
      ],
      'usd'
    )

    expect(prices[cake]).toBe(1.96)
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

    expect(cachedCoinPricesForFiat(client, 'usd')[cake]).toBe(1.96)
    expect(cachedCoinPricesForFiat(client, 'eur')[cake]).toBe(9)
  })
})
