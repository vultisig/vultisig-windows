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
