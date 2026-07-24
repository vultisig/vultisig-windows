/**
 * Percentage steps offered above the market price. `0` is "Market" — the order
 * still rests, it just starts at the current rate.
 */
export const limitPricePresets = [0, 1, 5, 10] as const

export type LimitPricePreset = (typeof limitPricePresets)[number]

/**
 * Above this multiple of market, an order is unlikely to ever fill within its
 * TTL. Matches iOS's far-above-market threshold.
 */
const farAboveMarketMultiplier = 1.2

type GetPresetPriceInput = {
  marketPrice: number
  preset: LimitPricePreset
}

/** Target price for a preset, in target units per source unit. */
export const getPresetPrice = ({
  marketPrice,
  preset,
}: GetPresetPriceInput): number => marketPrice * (1 + preset / 100)

type GetPercentFromMarketInput = {
  price: number
  marketPrice: number
}

/**
 * How far a price sits above (positive) or below (negative) market, as a
 * percentage. Returns `null` when there is no market price to compare against —
 * a zero market would otherwise divide to Infinity.
 */
export const getPercentFromMarket = ({
  price,
  marketPrice,
}: GetPercentFromMarketInput): number | null =>
  marketPrice > 0 ? ((price - marketPrice) / marketPrice) * 100 : null

export type LimitPriceWarning = 'atOrBelowMarket' | 'farAboveMarket'

type GetLimitPriceWarningInput = {
  price: number
  marketPrice: number | undefined
}

/**
 * Advisory (never blocking) warning for a target price.
 *
 * At or below market fills more or less immediately, which is usually not what
 * someone reaching for a limit order wants. Far above market is the opposite
 * risk: it likely expires unfilled and refunds, minus the network fee.
 */
export const getLimitPriceWarning = ({
  price,
  marketPrice,
}: GetLimitPriceWarningInput): LimitPriceWarning | undefined => {
  if (!marketPrice || marketPrice <= 0 || price <= 0) {
    return undefined
  }

  if (price <= marketPrice) {
    return 'atOrBelowMarket'
  }

  return price > marketPrice * farAboveMarketMultiplier
    ? 'farAboveMarket'
    : undefined
}

/**
 * Parse a user-entered price.
 *
 * Accepts a comma as the decimal separator so a locale that types `0,04` is not
 * silently read as `0` or `4`. Returns `null` for anything that is not a single
 * positive finite number — the caller blocks placement rather than guessing.
 */
export const parseLimitPrice = (input: string): number | null => {
  const normalized = input.trim().replace(',', '.')

  if (!/^\d*\.?\d+$/.test(normalized)) {
    return null
  }

  const value = Number(normalized)

  return Number.isFinite(value) && value > 0 ? value : null
}
