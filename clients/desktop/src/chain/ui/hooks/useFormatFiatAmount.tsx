import { useCallback } from 'react';

import { useGlobalCurrency } from '../../../lib/hooks/useGlobalCurrency';
import { formatAmount } from '@lib/utils/formatAmount';

export const useFormatFiatAmount = () => {
  const { globalCurrency } = useGlobalCurrency();

  return useCallback(
    (value: number) => formatAmount(value, globalCurrency),
    [globalCurrency]
  );
};
