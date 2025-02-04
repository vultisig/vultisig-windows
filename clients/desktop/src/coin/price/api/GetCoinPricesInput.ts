import { FiatCurrency } from '../FiatCurrency';

export type GetCoinPricesInput = {
  ids: string[];
  fiatCurrency?: FiatCurrency;
};
