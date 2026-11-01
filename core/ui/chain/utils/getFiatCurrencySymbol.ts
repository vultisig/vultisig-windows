import { FiatCurrency } from '@vultisig/core-config/FiatCurrency'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

import { fiatCurrencyFormatLocale, formatFiatToParts } from './formatFiatAmount'
import { getNumberFormat } from './getNumberFormat'

const getFiatCurrencyParts = (currency: FiatCurrency) =>
  formatFiatToParts({
    numberFormat: getNumberFormat({
      locale: fiatCurrencyFormatLocale[currency],
      style: 'currency',
      currency: currency.toUpperCase(),
    }),
    value: 0,
    currency,
  })

/**
 * The symbol `formatFiatAmount` prints with an amount in this currency
 * (`$` for usd, `€` for eur, `CA$` for cad). `fiatCurrencySymbolRecord` is
 * the form meant for settings, not for amounts.
 */
export const getFiatCurrencySymbol = (currency: FiatCurrency) =>
  shouldBePresent(
    getFiatCurrencyParts(currency).find(({ type }) => type === 'currency'),
    'currency part'
  ).value

const numberPartTypes: Intl.NumberFormatPartTypes[] = [
  'integer',
  'group',
  'decimal',
  'fraction',
]

type FiatCurrencyAffixes = {
  prefix: string
  suffix: string
}

const fiatCurrencyAffixes = new Map<FiatCurrency, FiatCurrencyAffixes>()

/**
 * What `formatFiatAmount` prints before and after the number in this
 * currency, spacing included (`$` and `` for usd, `` and ` €` for eur), so an
 * editable fiat field carries its symbol on the same side as the formatted
 * line it stands in for.
 */
export const getFiatCurrencyAffixes = (
  currency: FiatCurrency
): FiatCurrencyAffixes => {
  const cached = fiatCurrencyAffixes.get(currency)
  if (cached) return cached

  const parts = getFiatCurrencyParts(currency)
  const isNumberPart = ({ type }: Intl.NumberFormatPart) =>
    numberPartTypes.includes(type)
  const join = (affix: Intl.NumberFormatPart[]) =>
    affix.map(({ value }) => value).join('')
  const affixes = {
    prefix: join(parts.slice(0, parts.findIndex(isNumberPart))),
    suffix: join(parts.slice(parts.findLastIndex(isNumberPart) + 1)),
  }
  fiatCurrencyAffixes.set(currency, affixes)

  return affixes
}
