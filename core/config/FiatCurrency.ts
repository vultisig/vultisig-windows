export const fiatCurrencies = [
  'usd',
  'eur',
  'gbp',
  'chf',
  'jpy',
  'cny',
  'cad',
  'aud',
  'sgd',
  'sek',
] as const
export type FiatCurrency = (typeof fiatCurrencies)[number]

export const defaultFiatCurrency: FiatCurrency = 'usd'

export const fiatCurrencyNameRecord: Record<FiatCurrency, string> = {
  usd: 'US Dollar',
  eur: 'Euro',
  gbp: 'British Pound',
  chf: 'Swiss Franc',
  jpy: 'Japanese Yen',
  cny: 'Chinese Yuan',
  cad: 'Canadian Dollar',
  aud: 'Australian Dollar',
  sgd: 'Singapore Dollar',
  sek: 'Swedish Krona',
}

export const fiatCurrencySymbolRecord: Record<FiatCurrency, string> = {
  usd: 'US$',
  eur: '€',
  gbp: '£',
  chf: 'CHF',
  jpy: 'JP¥',
  cny: 'CN¥',
  cad: 'CA$',
  aud: 'AU$',
  sgd: 'SGD',
  sek: 'SEK',
}
