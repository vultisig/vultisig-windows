import { QueryClient, QueryKey } from '@tanstack/react-query'
import {
  fiatCurrencies,
  FiatCurrency,
} from '@vultisig/core-config/FiatCurrency'
import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'

export const keptPriceMaxAge = convertDuration(1, 'h', 'ms')

export type StampedPrice = {
  price: number
  fetchedAt: number
}

type CachedCoinPrices = {
  fiatCurrency?: FiatCurrency
  updatedAt: number
  prices?: unknown
}

export function previousCoinPricesForFiat(
  cached: readonly CachedCoinPrices[],
  fiatCurrency: FiatCurrency,
  now = Date.now()
): Record<string, StampedPrice> {
  const merged: Record<string, StampedPrice> = {}
  const ordered = [...cached].sort(
    (left, right) => left.updatedAt - right.updatedAt
  )
  for (const entry of ordered) {
    if (entry.fiatCurrency !== fiatCurrency) continue
    const stamps = stampsFrom(entry.prices, entry.updatedAt)
    if (!stamps) continue
    for (const [key, stamp] of Object.entries(stamps)) {
      const current = merged[key]
      if (!current || stamp.fetchedAt >= current.fetchedAt) merged[key] = stamp
    }
  }
  return Object.fromEntries(
    Object.entries(merged).filter(
      ([, stamp]) => now - stamp.fetchedAt <= keptPriceMaxAge
    )
  )
}

export function cachedCoinPricesForFiat(
  queryClient: QueryClient,
  fiatCurrency: FiatCurrency,
  now = Date.now()
): Record<string, StampedPrice> {
  const cached = queryClient
    .getQueryCache()
    .findAll({ queryKey: ['coinPrices'] })
    .map(query => ({
      fiatCurrency: fiatCurrencyFromQueryKey(query.queryKey),
      updatedAt: query.state.dataUpdatedAt,
      prices: query.state.data,
    }))
  return previousCoinPricesForFiat(cached, fiatCurrency, now)
}

function fiatCurrencyFromQueryKey(
  queryKey: QueryKey
): FiatCurrency | undefined {
  const input = queryKey[1]
  if (!input || typeof input !== 'object' || !('fiatCurrency' in input)) return
  const fiatCurrency = input.fiatCurrency
  return fiatCurrencies.find(currency => currency === fiatCurrency)
}

function stampsFrom(
  value: unknown,
  updatedAt: number
): Record<string, StampedPrice> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return
  const record = value as Record<string, unknown>
  const values = Object.values(record)
  if (values.every(isStampedPrice))
    return record as Record<string, StampedPrice>
  if (!values.every(item => typeof item === 'number')) return
  const stamps: Record<string, StampedPrice> = {}
  for (const [key, price] of Object.entries(record)) {
    if (typeof price === 'number' && price > 0) {
      stamps[key] = { price, fetchedAt: updatedAt }
    }
  }
  return stamps
}

const isStampedPrice = (value: unknown): value is StampedPrice => {
  if (!value || typeof value !== 'object') return false
  const stamp = value as StampedPrice
  return typeof stamp.price === 'number' && typeof stamp.fetchedAt === 'number'
}

export const erc20PricesFromQueryData = (
  value: unknown
): Record<string, number> | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return
  const record = value as Record<string, unknown>
  const values = Object.values(record)
  if (values.every(item => typeof item === 'number')) {
    return record as Record<string, number>
  }
  if (!values.every(isStampedPrice)) return
  return Object.fromEntries(
    Object.entries(record).map(([key, stamp]) => [
      key,
      (stamp as StampedPrice).price,
    ])
  )
}
