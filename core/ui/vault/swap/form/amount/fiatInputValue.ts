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

/**
 * Accepts the characters a fiat amount may be typed with: digits and at most
 * one dot. Returns the normalized string, or `undefined` for a rejected edit
 * so the field keeps what it had.
 */
export const parseFiatInputValue = (value: string) => {
  const normalized = value.replace(/-/g, '')

  if (!/^\d*\.?\d*$/.test(normalized)) {
    return undefined
  }

  return normalized.startsWith('.') ? `0${normalized}` : normalized
}
