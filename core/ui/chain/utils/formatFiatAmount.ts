import { FiatCurrency } from '@vultisig/core-config/FiatCurrency'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

import { getNumberFormat } from './getNumberFormat'

/**
 * The locale each fiat currency is formatted in, whatever the app language,
 * so an amount reads the same on every screen and every Vultisig app.
 */
export const fiatCurrencyFormatLocale: Record<FiatCurrency, string> = {
  usd: 'en-US',
  eur: 'de-DE',
  gbp: 'en-GB',
  chf: 'de-CH',
  jpy: 'ja-JP',
  cny: 'zh-CN',
  cad: 'en-CA',
  aud: 'en-AU',
  sgd: 'en-SG',
  sek: 'sv-SE',
}

/**
 * Symbols that replace a bare `$` in their currency's locale, so a dollar
 * amount never reads as US dollars.
 */
const disambiguatedFiatCurrencySymbol: Partial<Record<FiatCurrency, string>> = {
  cad: 'CA$',
  aud: 'A$',
  sgd: 'S$',
  cny: 'CN¥',
}

/** Amounts from this value up are shown in compact notation (1.2M). */
const compactNotationThreshold = 1_000_000
// Below this an amount would round to zero at the currency's own decimals.
const getSmallestStandardAmount = (fractionDigits: number) =>
  0.5 * 10 ** -fractionDigits
const tinyAmountSignificantDigits = 4
// Leading zeros from which they collapse into a subscript count (0.0₇3).
const subscriptNotationThreshold = 4
const subscriptDigits = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']

const toSubscript = (value: number) =>
  Array.from(String(value), digit => subscriptDigits[Number(digit)]).join('')

const getTinyAmountDecimals = (value: number) => {
  let exponent = Math.floor(Math.log10(value))
  let digits = (value / 10 ** exponent).toFixed(tinyAmountSignificantDigits - 1)
  // Rounding can carry the significand to 10 (9.9996 -> "10.0").
  if (Number(digits) >= 10) {
    exponent += 1
    digits = (value / 10 ** exponent).toFixed(tinyAmountSignificantDigits - 1)
  }

  const significantDigits = digits.replace('.', '').replace(/0+$/, '') || '0'
  const leadingZeros = -exponent - 1

  return leadingZeros >= subscriptNotationThreshold
    ? `0${toSubscript(leadingZeros)}${significantDigits}`
    : `${'0'.repeat(leadingZeros)}${significantDigits}`
}

type FormatFiatToPartsInput = {
  numberFormat: Intl.NumberFormat
  value: number
  currency: FiatCurrency
}

/**
 * `numberFormat.formatToParts(value)` with the currency symbol
 * disambiguated (`CA$`, `A$`, `S$`, `CN¥`).
 */
export const formatFiatToParts = ({
  numberFormat,
  value,
  currency,
}: FormatFiatToPartsInput) =>
  numberFormat.formatToParts(value).map(part =>
    part.type === 'currency'
      ? {
          ...part,
          value: disambiguatedFiatCurrencySymbol[currency] ?? part.value,
        }
      : part
  )

type FormatFiatPartsInput = FormatFiatToPartsInput & {
  fraction?: string
}

const formatFiatParts = ({ fraction, ...input }: FormatFiatPartsInput) =>
  formatFiatToParts(input)
    .map(part =>
      part.type === 'fraction' && fraction !== undefined ? fraction : part.value
    )
    .join('')

type FormatFiatAmountInput = {
  value: number
  currency: FiatCurrency
  /** Compact notation from a million up (1.2B); off for a price the user verifies. */
  compact?: boolean
}

/**
 * Formats a fiat amount in its currency's fixed locale: compact notation from
 * a million up (1.2B) unless `compact` is false, significant digits or
 * subscript notation below a cent so a tiny amount never shows as zero, two
 * the currency's own decimals otherwise. CAD, AUD, SGD and CNY print `CA$`,
 * `A$`, `S$` and `CN¥` so they never read as USD or JPY.
 */
export const formatFiatAmount = ({
  value,
  currency,
  compact = true,
}: FormatFiatAmountInput) => {
  const currencyOptions = {
    locale: fiatCurrencyFormatLocale[currency],
    style: 'currency',
    currency: currency.toUpperCase(),
  } as const

  if (compact && value >= compactNotationThreshold) {
    const { minimumFractionDigits } =
      getNumberFormat(currencyOptions).resolvedOptions()

    return formatFiatParts({
      numberFormat: getNumberFormat({
        ...currencyOptions,
        notation: 'compact',
        minimumFractionDigits,
        maximumFractionDigits: 2,
      }),
      value,
      currency,
    })
  }

  const maximumFractionDigits = shouldBePresent(
    getNumberFormat(currencyOptions).resolvedOptions().maximumFractionDigits,
    'currency fraction digits'
  )

  if (value > 0 && value < getSmallestStandardAmount(maximumFractionDigits)) {
    return formatFiatParts({
      numberFormat: getNumberFormat({
        ...currencyOptions,
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
      value: 0,
      currency,
      fraction: getTinyAmountDecimals(value),
    })
  }

  return formatFiatParts({
    numberFormat: getNumberFormat({
      ...currencyOptions,
      maximumFractionDigits,
    }),
    value,
    currency,
  })
}
