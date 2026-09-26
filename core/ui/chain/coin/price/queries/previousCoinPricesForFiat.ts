import { QueryClient, QueryKey } from '@tanstack/react-query'
import {
  fiatCurrencies,
  FiatCurrency,
} from '@vultisig/core-config/FiatCurrency'

type CachedCoinPrices = {
  fiatCurrency?: FiatCurrency
  updatedAt: number
  prices?: Record<string, number>
}

export function previousCoinPricesForFiat(
  cached: readonly CachedCoinPrices[],
  fiatCurrency: FiatCurrency
): Record<string, number> {
  const merged: Record<string, number> = {}
  const ordered = [...cached].sort(
    (left, right) => left.updatedAt - right.updatedAt
  )
  for (const entry of ordered) {
    if (entry.fiatCurrency !== fiatCurrency || !entry.prices) continue
    for (const [key, price] of Object.entries(entry.prices)) {
      // A stored 0 is the missing-price fill, not a quote.
      if (price > 0) merged[key] = price
    }
  }
  return merged
}

export function cachedCoinPricesForFiat(
  queryClient: QueryClient,
  fiatCurrency: FiatCurrency
): Record<string, number> {
  const cached = queryClient
    .getQueryCache()
    .findAll({ queryKey: ['coinPrices'] })
    .map(query => ({
      fiatCurrency: fiatCurrencyFromQueryKey(query.queryKey),
      updatedAt: query.state.dataUpdatedAt,
      prices: priceRecord(query.state.data),
    }))
  return previousCoinPricesForFiat(cached, fiatCurrency)
}

function fiatCurrencyFromQueryKey(
  queryKey: QueryKey
): FiatCurrency | undefined {
  const input = queryKey[1]
  if (!input || typeof input !== 'object' || !('fiatCurrency' in input)) return
  const fiatCurrency = input.fiatCurrency
  return fiatCurrencies.find(currency => currency === fiatCurrency)
}

function priceRecord(value: unknown): Record<string, number> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return
  const record = value as Record<string, unknown>
  if (!Object.values(record).every(item => typeof item === 'number')) return
  return record as Record<string, number>
}
