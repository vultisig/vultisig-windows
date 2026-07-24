/**
 * Price conversions for the limit form.
 *
 * The authoritative value is always the **rate**: buy-asset units per sell-asset
 * unit, which is exactly what the memo's LIM encodes. Fiat is a display and
 * entry convenience that converts to a rate once, at input.
 *
 * Keeping the rate authoritative is a fund-safety decision, matching iOS: if the
 * fiat figure were the source of truth, a drifting or bad price feed between
 * entry and signing would silently change the order the user actually commits
 * to.
 */

type RateToUnitPriceInput = {
  /** Buy-asset units per sell-asset unit. */
  rate: number
}

/**
 * Sell-asset units needed to buy one unit of the buy asset — the inverse of the
 * rate, and the orientation the form displays ("1 BTC is worth …").
 */
export const rateToUnitPrice = ({
  rate,
}: RateToUnitPriceInput): number | null => (rate > 0 ? 1 / rate : null)

type UnitPriceToRateInput = {
  /** Sell-asset units per one buy-asset unit. */
  unitPrice: number
}

/** Inverse of {@link rateToUnitPrice}. */
export const unitPriceToRate = ({
  unitPrice,
}: UnitPriceToRateInput): number | null =>
  unitPrice > 0 ? 1 / unitPrice : null

type FiatUnitPriceToRateInput = {
  /** Fiat price of one buy-asset unit, as entered. */
  fiatUnitPrice: number
  /** Fiat price of one sell-asset unit. */
  sellCoinFiatPrice: number | undefined
}

/**
 * Convert a fiat price per buy-asset unit into a rate.
 *
 * Returns `null` without a sell-asset fiat price rather than guessing — a
 * fabricated rate here would become the signed LIM.
 */
export const fiatUnitPriceToRate = ({
  fiatUnitPrice,
  sellCoinFiatPrice,
}: FiatUnitPriceToRateInput): number | null =>
  fiatUnitPrice > 0 && sellCoinFiatPrice && sellCoinFiatPrice > 0
    ? sellCoinFiatPrice / fiatUnitPrice
    : null

type RateToFiatUnitPriceInput = {
  rate: number
  sellCoinFiatPrice: number | undefined
}

/** Fiat price of one buy-asset unit implied by a rate. */
export const rateToFiatUnitPrice = ({
  rate,
  sellCoinFiatPrice,
}: RateToFiatUnitPriceInput): number | null => {
  const unitPrice = rateToUnitPrice({ rate })

  return unitPrice !== null && sellCoinFiatPrice && sellCoinFiatPrice > 0
    ? unitPrice * sellCoinFiatPrice
    : null
}
