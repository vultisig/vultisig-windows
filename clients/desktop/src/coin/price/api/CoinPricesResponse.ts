import { FiatCurrency } from '../FiatCurrency';

export type CoinPricesResponse = Record<string, Record<FiatCurrency, number>>;
