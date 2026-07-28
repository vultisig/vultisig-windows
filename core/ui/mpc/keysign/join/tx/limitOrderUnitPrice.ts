import { formatAmount } from '@vultisig/lib-utils/formatAmount'

type GetLimitOrderUnitPriceLabelInput = {
  /** Sell amount in the sell coin's natural units. */
  sellAmount: number
  /** Guaranteed-minimum buy amount in the buy asset's natural units. */
  buyAmount: number
  sellTicker: string
  buyTicker: string
}

/**
 * The order's implied execution price, as `1 BUY = <rate> SELL`.
 *
 * Derived from the two amounts the memo and payload already fix, so it cannot
 * claim a rate the signed order would not honour.
 *
 * Formatted through `formatAmount`'s `ticker` option because its default
 * precision is 3 fraction digits — enough to collapse a realistic rate like
 * 0.00023518 ETH to a flat "0" on a screen whose entire purpose is verifying
 * the price.
 *
 * Returns `null` when no honest rate can be shown: a zero buy amount has no
 * rate, and one that still rounds away at full precision would render as "0",
 * which reads as a real price rather than as "too small to display".
 */
export const getLimitOrderUnitPriceLabel = ({
  sellAmount,
  buyAmount,
  sellTicker,
  buyTicker,
}: GetLimitOrderUnitPriceLabelInput): string | null => {
  if (buyAmount <= 0 || sellAmount <= 0) {
    return null
  }

  const rate = sellAmount / buyAmount
  const formatted = formatAmount(rate, { ticker: sellTicker })

  if (Number.parseFloat(formatted) === 0) {
    return null
  }

  return `1 ${buyTicker} = ${formatted}`
}
