import { useCallback } from 'react';

import { GeneralSwapQuote } from '../../../chain/swap/general/GeneralSwapQuote';
import { NativeSwapEnabledChain } from '../../../chain/swap/native/NativeSwapChain';
import { getNativeSwapDecimals } from '../../../chain/swap/native/utils/getNativeSwapDecimals';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useTransformQueryData } from '../../../lib/ui/query/hooks/useTransformQueryData';
import { matchRecordUnion } from '../../../lib/utils/matchRecordUnion';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { useToCoin } from '../state/toCoin';
import { useSwapQuoteQuery } from './useSwapQuoteQuery';

export const useSwapOutputAmountQuery = () => {
  const [toCoinKey] = useToCoin();

  const toCoin = useCurrentVaultCoin(toCoinKey);

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
          general: (quote: GeneralSwapQuote) => {
            return fromChainAmount(quote.dstAmount, toCoin.decimals);
          },
        });
      },
      [toCoin.decimals, toCoinKey.chain]
    )
  );
};
