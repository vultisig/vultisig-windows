import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

import { marketChartRangeStaleTime } from '../MarketChartRange'
import { getCoinMarketChartQueryKey } from './useCoinMarketChartQuery'

const source = { id: 'bitcoin' }
const series = [
  { timestamp: 1000, price: 1 },
  { timestamp: 2000, price: 2 },
]

describe('market chart query caching', () => {
  it('serves a fresh range from cache without refetching', async () => {
    const queryClient = new QueryClient()
    const queryFn = vi.fn().mockResolvedValue(series)
    const options = {
      queryKey: getCoinMarketChartQueryKey({
        source,
        fiatCurrency: 'usd',
        range: 'day',
      }),
      queryFn,
      staleTime: marketChartRangeStaleTime.day,
    } as const

    await queryClient.fetchQuery(options)
    await queryClient.fetchQuery(options)

    expect(queryFn).toHaveBeenCalledTimes(1)
  })

  it('refetches when the range changes the query key', async () => {
    const queryClient = new QueryClient()
    const queryFn = vi.fn().mockResolvedValue(series)

    await queryClient.fetchQuery({
      queryKey: getCoinMarketChartQueryKey({
        source,
        fiatCurrency: 'usd',
        range: 'day',
      }),
      queryFn,
      staleTime: marketChartRangeStaleTime.day,
    })
    await queryClient.fetchQuery({
      queryKey: getCoinMarketChartQueryKey({
        source,
        fiatCurrency: 'usd',
        range: 'week',
      }),
      queryFn,
      staleTime: marketChartRangeStaleTime.week,
    })

    expect(queryFn).toHaveBeenCalledTimes(2)
  })

  it('keys the cache by fiat currency', async () => {
    const usdKey = getCoinMarketChartQueryKey({
      source,
      fiatCurrency: 'usd',
      range: 'day',
    })
    const eurKey = getCoinMarketChartQueryKey({
      source,
      fiatCurrency: 'eur',
      range: 'day',
    })

    expect(usdKey).not.toEqual(eurKey)
  })

  it('fails open: a failed refetch keeps serving the last good series', async () => {
    const queryClient = new QueryClient()
    const queryKey = getCoinMarketChartQueryKey({
      source,
      fiatCurrency: 'usd',
      range: 'day',
    })

    await queryClient.fetchQuery({
      queryKey,
      queryFn: () => Promise.resolve(series),
      staleTime: 0,
    })

    await expect(
      queryClient.fetchQuery({
        queryKey,
        queryFn: () => Promise.reject(new Error('network down')),
        staleTime: 0,
        retry: false,
      })
    ).rejects.toThrow('network down')

    expect(queryClient.getQueryData(queryKey)).toEqual(series)
  })

  it('gives short-lived freshness to 1D and long-lived to 1Y/ALL', () => {
    expect(marketChartRangeStaleTime.day).toBeLessThan(
      marketChartRangeStaleTime.week
    )
    expect(marketChartRangeStaleTime.week).toBeLessThanOrEqual(
      marketChartRangeStaleTime.year
    )
    expect(marketChartRangeStaleTime.year).toBe(marketChartRangeStaleTime.all)
  })
})
