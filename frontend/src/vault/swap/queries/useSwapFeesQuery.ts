import { NativeSwapEnabledChain } from '../../../chain/swap/native/NativeSwapChain';
import { getNativeSwapDecimals } from '../../../chain/swap/native/utils/getNativeSwapDecimals';
import { getChainFeeCoin } from '../../../chain/tx/fee/utils/getChainFeeCoin';
import { getFeeAmount } from '../../../chain/tx/fee/utils/getFeeAmount';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { getCoinMetaKey } from '../../../coin/utils/coinMeta';
import { useTransformQueriesData } from '../../../lib/ui/query/hooks/useTransformQueriesData';
import { matchRecordUnion } from '../../../lib/utils/matchRecordUnion';
import { useFromCoin } from '../state/fromCoin';
import { useToCoin } from '../state/toCoin';
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
    ({ swapQuote, chainSpecific }) => {
      const fromFeeCoin = getChainFeeCoin(fromCoinKey.chain);

      return matchRecordUnion(swapQuote, {
        native: ({ fees }) => {
          const decimals = getNativeSwapDecimals(
            fromCoinKey.chain as NativeSwapEnabledChain
          );

          const feeAmount = getFeeAmount(chainSpecific);

          return [
            {
              ...toCoinKey,
              amount: fromChainAmount(fees.total, decimals),
            },
            {
              ...getCoinMetaKey(fromFeeCoin),
              amount: fromChainAmount(
                feeAmount,
                getChainFeeCoin(fromCoinKey.chain).decimals
              ),
            },
          ];
        },
        oneInch: ({ tx: { gasPrice, gas } }) => {
          return [
            {
              ...getCoinMetaKey(fromFeeCoin),
              amount: fromChainAmount(
                BigInt(gasPrice) * BigInt(gas),
                fromFeeCoin.decimals
              ),
            },
          ];
        },
      });
    }
  );
};
