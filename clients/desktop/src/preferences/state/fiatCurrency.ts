import { FiatCurrency } from '../../coin/price/FiatCurrency';
import { defaultFiatCurrency } from '../../coin/price/FiatCurrency';
import {
  PersistentStateKey,
  usePersistentState,
} from '../../state/persistentState';

export const useFiatCurrency = () => {
  return usePersistentState<FiatCurrency>(
    PersistentStateKey.FiatCurrency,
    defaultFiatCurrency
  );
};
