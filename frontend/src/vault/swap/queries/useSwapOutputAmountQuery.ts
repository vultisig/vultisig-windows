import { useCallback } from 'react';

import { NativeSwapEnabledChain } from '../../../chain/swap/native/NativeSwapChain';
import { getNativeSwapDecimals } from '../../../chain/swap/native/utils/getNativeSwapDecimals';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useTransformQueryData } from '../../../lib/ui/query/hooks/useTransformQueryData';
import { matchRecordUnion } from '../../../lib/utils/matchRecordUnion';
import { useToCoin } from '../state/toCoin';
import { useSwapQuoteQuery } from './useSwapQuoteQuery';

export const useSwapOutputAmountQuery = () => {
  const [toCoinKey] = useToCoin();

  return useTransformQueryData(
    useSwapQuoteQuery(),
    useCallback(
      swapQuote => {
        return matchRecordUnion(swapQuote, {
          native: ({ expected_amount_out }) =>
            fromChainAmount(
              expected_amount_out,
              getNativeSwapDecimals(toCoinKey.chain as NativeSwapEnabledChain)
            ),
          oneInch: () => {
            throw new Error('OneInch swap is not supported yet');
          },
        });
      },
      [toCoinKey.chain]
    )
  );
};
