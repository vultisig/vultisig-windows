import { getNumberFormat } from '../../../chain/utils/getNumberFormat'

/** The character a locale writes between whole and fractional digits. */
export type DecimalSeparator = '.' | ','

let deviceDecimalSeparator: DecimalSeparator | undefined

/** The device locale's decimal separator, read once. */
export const getDeviceDecimalSeparator = (): DecimalSeparator => {
  deviceDecimalSeparator ??=
    getNumberFormat({ locale: navigator.language })
      .formatToParts(1.1)
      .find(part => part.type === 'decimal')?.value === ','
      ? ','
      : '.'

  return deviceDecimalSeparator
}

type NormalizeDecimalSeparatorInput = {
  text: string
  decimalSeparator: DecimalSeparator
}

/**
 * Text with at most one separator, written as a dot. A comma is the decimal
 * point only where the locale writes one; elsewhere it is refused. A dot is
 * always the decimal point. More than one separator is `undefined`: neither
 * is ever read as grouping, so `1,234.56` is refused rather than guessed at.
 */
export const normalizeDecimalSeparator = ({
  text,
  decimalSeparator,
}: NormalizeDecimalSeparatorInput) => {
  const separatorCount = text.replace(/[^.,]/g, '').length
  if (separatorCount > 1) return undefined
  if (!text.includes(',')) return text
  if (decimalSeparator !== ',') return undefined

  return text.replace(',', '.')
}

/**
 * Dot-based amount text written with the locale's decimal separator, so the
 * field shows the number the way the user reads it. Parsing the result with
 * the same separator gives back the dot-based text.
 */
export const localizeDecimalSeparator = ({
  text,
  decimalSeparator,
}: NormalizeDecimalSeparatorInput) =>
  decimalSeparator === ',' ? text.replace('.', ',') : text

/**
 * Amount field text as the inputs parse it: minus signs dropped, the decimal
 * separator written as a dot and a leading point given a zero. `undefined`
 * when the separators are refused.
 */
export const normalizeAmountText = ({
  text,
  decimalSeparator,
}: NormalizeDecimalSeparatorInput) => {
  const separated = normalizeDecimalSeparator({
    text: text.replace(/-/g, ''),
    decimalSeparator,
  })
  if (separated === undefined) return undefined

  return separated.startsWith('.') ? `0${separated}` : separated
}
