import {
  AmountInputSource,
  isAmbiguousGroupedPaste,
} from '@core/ui/vault/send/amount/amountInputSource'

const standardFractionDigits = 2

/**
 * Renders a fiat amount as the digits a fiat input should hold: two fraction
 * digits like the formatted line, trailing zeros dropped, and enough digits
 * kept for a sub-cent amount that the field never shows a misleading "0".
 */
export const getFiatInputValue = (amount: number) => {
  const fractionDigits =
    amount > 0 && amount < 10 ** -standardFractionDigits
      ? -Math.floor(Math.log10(amount)) + 1
      : standardFractionDigits

  const fixed = amount.toFixed(fractionDigits)

  return fixed.includes('.') ? fixed.replace(/\.?0+$/, '') : fixed
}

type ParseFiatInputValueInput = {
  value: string
  source?: AmountInputSource
}

/**
 * Accepts the characters a fiat amount may be typed with: digits and at most
 * one decimal separator. A typed comma is read as that separator, since
 * refusing it would drop the keystroke and let the next digit join the integer
 * part, turning `1,5` into `15` (#5289). A paste that reads as one grouped
 * thousand is refused instead, since `1,000` there is as likely to mean a
 * thousand as one unit. Returns the normalized string, or `undefined` for a
 * rejected edit so the field keeps what it had.
 */
export const parseFiatInputValue = ({
  value,
  source = 'typing',
}: ParseFiatInputValueInput) => {
  if (isAmbiguousGroupedPaste({ value, source })) {
    return undefined
  }

  const normalized = value.replace(/-/g, '').replace(/,/g, '.')

  if (!/^\d*\.?\d*$/.test(normalized)) {
    return undefined
  }

  return normalized.startsWith('.') ? `0${normalized}` : normalized
}
