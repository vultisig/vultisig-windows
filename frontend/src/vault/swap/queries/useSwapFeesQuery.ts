import { GeneralSwapQuote } from '../../../chain/swap/GeneralSwapQuote';
import { NativeSwapEnabledChain } from '../../../chain/swap/native/NativeSwapChain';
import { getNativeSwapDecimals } from '../../../chain/swap/native/utils/getNativeSwapDecimals';
import { getChainFeeCoin } from '../../../chain/tx/fee/utils/getChainFeeCoin';
import { getFeeAmount } from '../../../chain/tx/fee/utils/getFeeAmount';
import { getCoinMetaKey } from '../../../coin/utils/coinMeta';
import { useTransformQueriesData } from '../../../lib/ui/query/hooks/useTransformQueriesData';
import { matchRecordUnion } from '../../../lib/utils/matchRecordUnion';
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
      const fromFeeCoin = getChainFeeCoin(fromCoinKey.chain);

      const fromGeneralSwapQuote = ({
        tx: { gasPrice, gas },
      }: GeneralSwapQuote) => {
        return {
          swap: {
            ...getCoinMetaKey(fromFeeCoin),
            amount: BigInt(gasPrice) * BigInt(gas),
            decimals: fromFeeCoin.decimals,
          },
        };
      };

      return matchRecordUnion(swapQuote, {
        native: ({ fees }): SwapFees => {
          const decimals = getNativeSwapDecimals(
            fromCoinKey.chain as NativeSwapEnabledChain
          );

          const feeAmount = getFeeAmount(chainSpecific);

          return {
            swap: {
              ...toCoinKey,
              amount: BigInt(fees.total),
              decimals,
            },
            network: {
              ...getCoinMetaKey(fromFeeCoin),
              amount: feeAmount,
              decimals: getChainFeeCoin(fromCoinKey.chain).decimals,
              chainSpecific,
            },
          };
        },
        oneInch: fromGeneralSwapQuote,
        lifi: fromGeneralSwapQuote,
      });
    }
  );
};
