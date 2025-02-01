import { currencyOptions } from '../../../../pages/vaultSettings/vaultCurrency/constants';

export const matchCurrencySymbol = (currency: string) => {
  if (!currency) {
    return null;
  }

  return currencyOptions.find(option => option.value === currency);
};
