import { useCallback } from 'react';

import { getChainFeeCoin } from '../../../chain/tx/fee/utils/getChainFeeCoin';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useTransformQueryData } from '../../../lib/ui/query/hooks/useTransformQueryData';
import { Chain } from '../../../model/chain';
import { useSwapQuoteQuery } from './useSwapQuoteQuery';

export const useSwapOutputAmountQuery = () => {
  const { decimals } = getChainFeeCoin(Chain.THORChain);

  return useTransformQueryData(
    useSwapQuoteQuery(),
    useCallback(
      ({ expected_amount_out }) =>
        fromChainAmount(expected_amount_out, decimals),
      [decimals]
    )
  );
};
