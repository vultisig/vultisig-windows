import { Fiat } from '../../../model/fiat';
import {
  currencies,
  currencyToSymbolMap,
} from '../../../pages/vaultSettings/vaultCurrency/constants';
import {
  PersistentStateKey,
  usePersistentState,
} from '../../../state/persistentState';

export const useGlobalCurrency = () => {
  const [globalCurrency, setGlobalCurrency] = usePersistentState(
    PersistentStateKey.Currency,
    currencies[0]
  );

  return {
    globalCurrency,
    changeGlobalCurrency: (newCurrency: Fiat) => setGlobalCurrency(newCurrency),
    globalCurrencySymbol: currencyToSymbolMap[globalCurrency].symbol,
  };
};
