import { useCallback } from 'react';

import { thorchainSwapConfig } from '../../../chain/thor/swap/config';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useTransformQueryData } from '../../../lib/ui/query/hooks/useTransformQueryData';
import { useSwapQuoteQuery } from './useSwapQuoteQuery';

export const useSwapOutputAmountQuery = () => {
  return useTransformQueryData(
    useSwapQuoteQuery(),
    useCallback(
      ({ expected_amount_out }) =>
        fromChainAmount(expected_amount_out, thorchainSwapConfig.decimals),
      []
    )
  );
};
