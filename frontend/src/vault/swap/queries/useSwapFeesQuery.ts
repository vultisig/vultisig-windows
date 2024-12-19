import { defaultEvmTransferGasLimit } from '../../../chain/evm/evmGasLimit';
import { NativeSwapEnabledChain } from '../../../chain/swap/native/NativeSwapChain';
import { getNativeSwapDecimals } from '../../../chain/swap/native/utils/getNativeSwapDecimals';
import { getChainFeeCoin } from '../../../chain/tx/fee/utils/getChainFeeCoin';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { getCoinMetaKey } from '../../../coin/utils/coinMeta';
import { useTransformQueriesData } from '../../../lib/ui/query/hooks/useTransformQueriesData';
import { matchRecordUnion } from '../../../lib/utils/matchRecordUnion';
import { useFromCoin } from '../state/fromCoin';
import { useToCoin } from '../state/toCoin';
import { useSwapQuoteQuery } from './useSwapQuoteQuery';
import { useSwapSpecificTxInfoQuery } from './useSwapSpecificTxInfoQuery';

export const useSwapFeesQuery = () => {
  const swapQuoteQuery = useSwapQuoteQuery();

  const [fromCoinKey] = useFromCoin();
  const [toCoinKey] = useToCoin();

  const txInfoQuery = useSwapSpecificTxInfoQuery();

  return useTransformQueriesData(
    {
      swapQuote: swapQuoteQuery,
      txInfo: txInfoQuery,
    },
    ({ swapQuote, txInfo }) => {
      const fromFeeCoin = getChainFeeCoin(fromCoinKey.chain);

      return matchRecordUnion(swapQuote, {
        native: ({ fees }) => {
          const decimals = getNativeSwapDecimals(
            fromCoinKey.chain as NativeSwapEnabledChain
          );

          return [
            {
              ...toCoinKey,
              amount: fromChainAmount(fees.total, decimals),
            },
            {
              ...getCoinMetaKey(fromFeeCoin),
              amount: fromChainAmount(
                BigInt(Math.round(txInfo.fee)),
                fromFeeCoin.decimals
              ),
            },
          ];
        },
        oneInch: ({ tx: { gasPrice } }) => {
          return [
            {
              ...getCoinMetaKey(fromFeeCoin),
              amount: fromChainAmount(
                BigInt(gasPrice) * BigInt(defaultEvmTransferGasLimit),
                fromFeeCoin.decimals
              ),
            },
          ];
        },
      });
    }
  );
};
