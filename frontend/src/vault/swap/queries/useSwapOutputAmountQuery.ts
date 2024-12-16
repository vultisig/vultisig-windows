import { useCallback } from 'react';

import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { getChainPrimaryCoin } from '../../../chain/utils/getChainPrimaryCoin';
import { useTransformQueryData } from '../../../lib/ui/query/hooks/useTransformQueryData';
import { Chain } from '../../../model/chain';
import { useSwapQuoteQuery } from './useSwapQuoteQuery';

export const useSwapOutputAmountQuery = () => {
  const { decimals } = getChainPrimaryCoin(Chain.THORChain);

  return useTransformQueryData(
    useSwapQuoteQuery(),
    useCallback(
      ({ expected_amount_out }) =>
        fromChainAmount(expected_amount_out, decimals),
      [decimals]
    )
  );
};
