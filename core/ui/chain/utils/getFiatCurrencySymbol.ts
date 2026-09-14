import { FiatCurrency } from '@vultisig/core-config/FiatCurrency'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

/**
 * The symbol `formatAmount` prints in front of an amount in this currency
 * (`$` for usd, `€` for eur), so an editable fiat field carries the same
 * prefix as the formatted line it stands in for. `fiatCurrencySymbolRecord`
 * is the disambiguated form (`US$`) meant for settings, not for amounts.
 */
export const getFiatCurrencySymbol = (currency: FiatCurrency) => {
  const part = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  })
    .formatToParts(0)
    .find(({ type }) => type === 'currency')

  return shouldBePresent(part, 'currency part').value
}
