/**
 * Price conversions for the limit form.
 *
 * The authoritative value is always the **rate**: buy-asset units per sell-asset
 * unit, which is exactly what the memo's LIM encodes. It is also what asset mode
 * displays and edits directly ("When 1 ETH is worth 0.0295 BTC"), so asset entry
 * needs no conversion. Fiat is a display and entry convenience that converts to
 * a rate once, at input.
 *
 * Keeping the rate authoritative is a fund-safety decision: if the fiat figure
 * were the source of truth, a drifting or bad price feed between entry and
 * signing would silently change the order the user actually commits to.
 */

type RateToSellUnitFiatValueInput = {
  /** Buy-asset units per sell-asset unit. */
  rate: number
  /** Fiat price of one buy-asset unit. */
  buyCoinFiatPrice: number | undefined
}

/**
 * Fiat value of one sell-asset unit at the target rate — the figure fiat mode
 * shows under "When 1 ETH is worth".
 *
 * Returns `null` without a buy-asset fiat price rather than guessing.
 */
export const rateToSellUnitFiatValue = ({
  rate,
  buyCoinFiatPrice,
}: RateToSellUnitFiatValueInput): number | null =>
  rate > 0 && buyCoinFiatPrice && buyCoinFiatPrice > 0
    ? rate * buyCoinFiatPrice
    : null

type SellUnitFiatValueToRateInput = {
  /** Fiat value of one sell-asset unit, as entered. */
  fiatValue: number
  buyCoinFiatPrice: number | undefined
}

/**
 * Convert an entered fiat value of one sell-asset unit into a rate.
 *
 * Returns `null` without a buy-asset fiat price rather than guessing — a
 * fabricated rate here would become the signed LIM.
 */
export const sellUnitFiatValueToRate = ({
  fiatValue,
  buyCoinFiatPrice,
}: SellUnitFiatValueToRateInput): number | null =>
  fiatValue > 0 && buyCoinFiatPrice && buyCoinFiatPrice > 0
    ? fiatValue / buyCoinFiatPrice
    : null
