import { matchRecordUnion } from '@lib/utils/matchRecordUnion';

import { NativeSwapEnabledChain } from '../../../chain/swap/native/NativeSwapChain';
import { getNativeSwapDecimals } from '../../../chain/swap/native/utils/getNativeSwapDecimals';
import { getFeeAmount } from '../../../chain/tx/fee/utils/getFeeAmount';
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin';
import { useTransformQueriesData } from '../../../lib/ui/query/hooks/useTransformQueriesData';
import { useFromCoin } from '../state/fromCoin';
import { useToCoin } from '../state/toCoin';
import { SwapFees } from '../types/SwapFee';
import { useSwapChainSpecificQuery } from './useSwapChainSpecificQuery';
import { useSwapQuoteQuery } from './useSwapQuoteQuery';

export const useSwapFeesQuery = () => {
  const swapQuoteQuery = useSwapQuoteQuery();

  const [fromCoinKey] = useFromCoin();
  const [toCoinKey] = useToCoin();

  const chainSpecificQuery = useSwapChainSpecificQuery();

  return useTransformQueriesData(
    {
      swapQuote: swapQuoteQuery,
      chainSpecific: chainSpecificQuery,
    },
    ({ swapQuote, chainSpecific }): SwapFees => {
      const fromFeeCoin = chainFeeCoin[fromCoinKey.chain];

      return matchRecordUnion(swapQuote, {
        native: ({ fees }) => {
          const decimals = getNativeSwapDecimals(
            fromCoinKey.chain as NativeSwapEnabledChain
          );

          const feeAmount = getFeeAmount(chainSpecific);

          const result: SwapFees = {
            swap: {
              ...toCoinKey,
              amount: BigInt(fees.total),
              decimals,
            },
            network: {
              ...fromFeeCoin,
              amount: feeAmount,
              decimals: fromFeeCoin.decimals,
              chainSpecific,
            },
          };

          return result;
        },
        general: ({ tx: { gasPrice, gas } }) => {
          return {
            swap: {
              chain: fromCoinKey.chain,
              id: fromCoinKey.id,
              amount: BigInt(gasPrice) * BigInt(gas),
              decimals: fromFeeCoin.decimals,
            },
          };
        },
      });
    }
  );
};
