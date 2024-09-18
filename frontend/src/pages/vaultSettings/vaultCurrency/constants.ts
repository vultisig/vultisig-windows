import { Fiat } from '../../../model/fiat';

export type CurrencyOption = {
  value: Fiat;
  title: string;
  symbol: string;
};

export const currencyOptions: CurrencyOption[] = [
  {
    value: Fiat.USD,
    title: 'vault_settings_currency_settings_title_usd',
    symbol: 'US$',
  },
  {
    value: Fiat.AUD,
    title: 'vault_settings_currency_settings_title_aud',
    symbol: 'A$',
  },
  {
    value: Fiat.EUR,
    title: 'vault_settings_currency_settings_title_eur',
    symbol: '€',
  },
  {
    value: Fiat.GBP,
    title: 'vault_settings_currency_settings_title_gbp',
    symbol: '£',
  },
  {
    value: Fiat.CHF,
    title: 'vault_settings_currency_settings_title_chf',
    symbol: 'CHF',
  },
  {
    value: Fiat.JPY,
    title: 'vault_settings_currency_settings_title_jpy',
    symbol: 'JP¥',
  },
  {
    value: Fiat.CNY,
    title: 'vault_settings_currency_settings_title_cny',
    symbol: 'CN¥',
  },
  {
    value: Fiat.CAD,
    title: 'vault_settings_currency_settings_title_cad',
    symbol: 'CA$',
  },
  {
    value: Fiat.SGD,
    title: 'vault_settings_currency_settings_title_sgd',
    symbol: 'SGD',
  },
  {
    value: Fiat.SEK,
    title: 'vault_settings_currency_settings_title_sek',
    symbol: 'SEK',
  },
];
