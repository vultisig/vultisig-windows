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

/** `price: null` records a successful lookup that returned no price for the coin. */
export type CachedPrice = {
  price: number | null
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
  const merged: Record<string, CachedPrice> = {}
  const ordered = [...cached].sort(
    (left, right) => left.updatedAt - right.updatedAt
  )
  for (const entry of ordered) {
    if (entry.fiatCurrency !== fiatCurrency) continue
    const stamps = stampsFrom(entry.prices)
    if (!stamps) continue
    for (const [key, stamp] of Object.entries(stamps)) {
      const current = merged[key]
      if (!current || stamp.fetchedAt >= current.fetchedAt) merged[key] = stamp
    }
  }
  const kept: Record<string, StampedPrice> = {}
  for (const [key, { price, fetchedAt }] of Object.entries(merged)) {
    if (price === null || now - fetchedAt > keptPriceMaxAge) continue
    kept[key] = { price, fetchedAt }
  }
  return kept
}

export function cachedCoinPricesForFiat(
  queryClient: QueryClient,
  fiatCurrency: FiatCurrency,
  now = Date.now()
): Record<string, StampedPrice> {
  const cached = queryClient
    .getQueryCache()
    .findAll({ queryKey: ['erc20Prices'] })
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

function stampsFrom(value: unknown): Record<string, CachedPrice> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return
  const stamps: Record<string, CachedPrice> = {}
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (!isCachedPrice(entry)) continue
    if (entry.price !== null && !Number.isFinite(entry.price)) continue
    if (!Number.isFinite(entry.fetchedAt)) continue
    stamps[key] = entry
  }
  return stamps
}

const isCachedPrice = (value: unknown): value is CachedPrice => {
  if (!value || typeof value !== 'object') return false
  const stamp = value as CachedPrice
  return (
    (stamp.price === null || typeof stamp.price === 'number') &&
    typeof stamp.fetchedAt === 'number'
  )
}
