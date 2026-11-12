import { toChainAmount } from '@vultisig/core-chain/amount/toChainAmount'

/** Significant digits kept in a coin amount derived from a fiat entry. */
const fiatDerivedSignificantDigits = 5

/** Fixed-point scale for the fiat value and the price; their quotient is exact for any price above 10^-36. */
const fiatConversionScale = 36

type RoundDownToSignificantDigitsInput = {
  amount: bigint
  decimals: number
  significantDigits: number
}

/**
 * `amount`, in base units of a coin with `decimals`, rounded down to
 * `significantDigits` significant digits. Whole units are never cut.
 */
export const roundDownToSignificantDigits = ({
  amount,
  decimals,
  significantDigits,
}: RoundDownToSignificantDigitsInput) => {
  if (amount <= 0n) return amount

  const digitCount = amount.toString().length
  const keptDecimals = Math.min(
    Math.max(significantDigits - digitCount + decimals, 0),
    decimals
  )
  const dropped = 10n ** BigInt(decimals - keptDecimals)

  return (amount / dropped) * dropped
}

type FiatTextToChainAmountInput = {
  text: string
  price: number
  decimals: number
}

/**
 * The coin amount, in base units, that a typed fiat value buys at `price`,
 * rounded down to five significant digits so it never buys more than was
 * typed. Exact decimal math, no floats. `null` for an empty field or a price
 * that cannot convert (not a finite positive number, or below 10^-36),
 * `undefined` for text that is not a number.
 */
export const fiatTextToChainAmount = ({
  text,
  price,
  decimals,
}: FiatTextToChainAmountInput) => {
  if (text === '') return null
  if (!/^\d*\.?\d*$/.test(text) || text === '.') return undefined

  if (!Number.isFinite(price) || price <= 0) return null

  const priceScaled = toChainAmount(price, fiatConversionScale)
  if (priceScaled === 0n) return null

  const fiatScaled = toChainAmount(text, fiatConversionScale)

  return roundDownToSignificantDigits({
    amount: (fiatScaled * 10n ** BigInt(decimals)) / priceScaled,
    decimals,
    significantDigits: fiatDerivedSignificantDigits,
  })
}

type ChainAmountToFiatTextInput = {
  amount: bigint
  decimals: number
  price: number
  fractionDigits: number
}

/**
 * The fiat value of `amount`, in base units of a coin with `decimals`, at
 * `price`: dot-based text with exactly `fractionDigits` decimals, truncated.
 * Exact decimal math, no floats. `null` for a price that cannot convert.
 */
export const chainAmountToFiatText = ({
  amount,
  decimals,
  price,
  fractionDigits,
}: ChainAmountToFiatTextInput) => {
  if (!Number.isFinite(price) || price < 0) return null

  const priceScaled = toChainAmount(price, fiatConversionScale)
  const minorUnits =
    (amount * priceScaled) /
    10n ** BigInt(decimals + fiatConversionScale - fractionDigits)
  if (fractionDigits === 0) return minorUnits.toString()

  const digits = minorUnits.toString().padStart(fractionDigits + 1, '0')

  return `${digits.slice(0, -fractionDigits)}.${digits.slice(-fractionDigits)}`
}
