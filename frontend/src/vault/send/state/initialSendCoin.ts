import { useMemo } from 'react';

import { coinKeyFromString } from '../../../coin/Coin';
import { useAppPathParams } from '../../../navigation/hooks/useAppPathParams';

export const useInitialSendCoin = () => {
  const [{ coin }] = useAppPathParams<'send'>();

  return useMemo(() => coinKeyFromString(coin), [coin]);
};
