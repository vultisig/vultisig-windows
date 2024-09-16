import {
  currencies,
  currencyToSymbolMap,
} from '../../../pages/vaultSettings/vaultCurrency/constants';
import {
  PersistentStateKey,
  usePersistentState,
} from '../../../state/persistentState';

export const useInAppCurrency = () => {
  const [currency, setCurrency] = usePersistentState(
    PersistentStateKey.Currency,
    currencies[0]
  );

  return {
    currency,
    changeInAppCurrency: (newCurrency: string) => setCurrency(newCurrency),
    currencySymbol: currencyToSymbolMap[currency].symbol,
  };
};
