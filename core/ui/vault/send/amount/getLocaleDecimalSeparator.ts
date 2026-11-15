const decimalSeparators = ['.', ','] as const

/**
 * The separator characters the send amount inputs can parse as a decimal
 * point. Anything else is refused rather than guessed at.
 */
export type DecimalSeparator = (typeof decimalSeparators)[number]

/**
 * Reads the decimal separator the given locale formats numbers with, so a
 * comma-decimal keyboard can type `1,5` where a dot-decimal one types `1.5`.
 * Locales that format with any other separator (Arabic-Indic `٫`, for example)
 * fall back to `.`, because the amount inputs store and parse dot decimals.
 */
export const getLocaleDecimalSeparator = (
  locales?: string | string[]
): DecimalSeparator => {
  const separator = new Intl.NumberFormat(locales)
    .formatToParts(1.1)
    .find(part => part.type === 'decimal')?.value

  return decimalSeparators.find(candidate => candidate === separator) ?? '.'
}
