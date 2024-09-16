export type CurrencyOption = {
  value: string;
  title: string;
  symbol: string;
};

export const currencyOptions: CurrencyOption[] = [
  {
    value: 'USD',
    title: 'vault_settings_currency_settings_title_usd',
    symbol: 'US$',
  },
  {
    value: 'AUD',
    title: 'vault_settings_currency_settings_title_aud',
    symbol: 'A$',
  },
  {
    value: 'EUR',
    title: 'vault_settings_currency_settings_title_eur',
    symbol: '€',
  },
  {
    value: 'GBP',
    title: 'vault_settings_currency_settings_title_gbp',
    symbol: '£',
  },
  {
    value: 'CHF',
    title: 'vault_settings_currency_settings_title_chf',
    symbol: 'CHF',
  },
  {
    value: 'JPY',
    title: 'vault_settings_currency_settings_title_jpy',
    symbol: 'JP¥',
  },
  {
    value: 'CNY',
    title: 'vault_settings_currency_settings_title_cny',
    symbol: 'CN¥',
  },
  {
    value: 'CAD',
    title: 'vault_settings_currency_settings_title_cad',
    symbol: 'CA$',
  },
  {
    value: 'SGD',
    title: 'vault_settings_currency_settings_title_sgd',
    symbol: 'SGD',
  },
  {
    value: 'SEK',
    title: 'vault_settings_currency_settings_title_sek',
    symbol: 'SEK',
  },
];

export const currencies = currencyOptions.map(option => option.value);

export const currencyToSymbolMap = currencyOptions.reduce(
  (acc, option) => {
    acc[option.value] = { symbol: option.symbol };
    return acc;
  },
  {} as Record<string, { symbol: string }>
);
