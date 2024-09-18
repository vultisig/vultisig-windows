import { Fiat } from '../../../model/fiat';
import {
  PersistentStateKey,
  usePersistentState,
} from '../../../state/persistentState';

const GLOBAL_CURRENCY_DEFAULT = Fiat.USD;

export const useGlobalCurrency = () => {
  const [globalCurrency, setGlobalCurrency] = usePersistentState(
    PersistentStateKey.Currency,
    GLOBAL_CURRENCY_DEFAULT
  );

  return {
    globalCurrency,
    updateGlobalCurrency: (newCurrency: Fiat) => setGlobalCurrency(newCurrency),
  };
};
