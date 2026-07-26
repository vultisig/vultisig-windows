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

/**
 * The most fractional digits a THORChain limit memo can encode for the target
 * price: the SDK scales it by 1e8 into a bigint and rejects anything finer.
 */
const limitPriceMaxFractionDigits = 8

/**
 * Round a rate to the memo's representable precision.
 *
 * A rate derived from a division (fiat entry, or the sell-per-buy inverse)
 * routinely carries more fractional digits than the memo can hold, which the SDK
 * builder rejects outright. Quantize it once — at the form's authoritative rate
 * — so the displayed price, the receive amount, and the signed LIM all agree on
 * the same value the memo will encode.
 */
export const quantizeTargetPrice = (rate: number): number =>
  Number(rate.toFixed(limitPriceMaxFractionDigits))

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
 * Only `.` is accepted as the decimal separator. A comma is deliberately
 * rejected rather than coerced: it is ambiguous between a decimal (`0,04`) and a
 * thousands separator (`65,800`), and silently reading the latter as `65.8`
 * would put a price 1000x off into the signed memo. Fail closed and let the user
 * retype with a dot. Returns `null` for anything that is not a single positive
 * finite number — the caller blocks placement rather than guessing.
 */
export const parseLimitPrice = (input: string): number | null => {
  const normalized = input.trim()

  if (!/^\d*\.?\d+$/.test(normalized)) {
    return null
  }

  const value = Number(normalized)

  return Number.isFinite(value) && value > 0 ? value : null
}
