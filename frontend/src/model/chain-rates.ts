import { Fiat } from './fiat';

export type CurrencyRates = {
  [key in keyof typeof Fiat]: number;
};

export type ChainRates = {
  [chain: string]: CurrencyRates;
};
