import { useCallback, useMemo } from 'react';

import {
  CoinKey,
  coinKeyFromString,
  coinKeyToString,
} from '../../../coin/Coin';
import { useAppPathParams } from '../../../navigation/hooks/useAppPathParams';

export const useCurrentSendCoin = () => {
  const [{ coin }, setParams] = useAppPathParams<'send'>();

  const value = useMemo(() => coinKeyFromString(coin), [coin]);

  const setValue = useCallback(
    (value: CoinKey) => {
      setParams({ coin: coinKeyToString(value) });
    },
    [setParams]
  );

  return [value, setValue] as const;
};
