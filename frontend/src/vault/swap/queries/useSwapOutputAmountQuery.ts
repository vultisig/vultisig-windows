import { useCallback } from 'react';

import { getChainFeeCoin } from '../../../chain/tx/fee/utils/getChainFeeCoin';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useTransformQueryData } from '../../../lib/ui/query/hooks/useTransformQueryData';
import { useSwapQuoteQuery } from './useSwapQuoteQuery';

export const useSwapOutputAmountQuery = () => {
  return useTransformQueryData(
    useSwapQuoteQuery(),
    useCallback(
      ({ expected_amount_out, swapChain }) =>
        fromChainAmount(
          expected_amount_out,
          getChainFeeCoin(swapChain).decimals
        ),
      []
    )
  );
};
