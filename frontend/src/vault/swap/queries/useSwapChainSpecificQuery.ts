import { getChainSpecific } from '../../../chain/keysign/chainSpecific/getChainSpecific';
import { GetChainSpecificInput } from '../../../chain/keysign/chainSpecific/GetChainSpecificInput';
import { getChainFeeCoin } from '../../../chain/tx/fee/utils/getChainFeeCoin';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { areEqualCoins } from '../../../coin/Coin';
import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { getChainSpecificQueryKey } from '../../../coin/query/useChainSpecificQuery';
import { getCoinMetaKey } from '../../../coin/utils/coinMeta';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useStateDependentQuery } from '../../../lib/ui/query/hooks/useStateDependentQuery';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { useFromAmount } from '../state/fromAmount';
import { useFromCoin } from '../state/fromCoin';
import { useSwapQuoteQuery } from './useSwapQuoteQuery';

export const useSwapChainSpecificQuery = () => {
  const [fromCoinKey] = useFromCoin();
  const fromStorageCoin = useCurrentVaultCoin(fromCoinKey);
  const fromCoin = storageCoinToCoin(fromStorageCoin);

  const fromCoinBalanceQuery = useBalanceQuery(fromCoin);

  const [fromAmount] = useFromAmount();

  const swapQuoteQuery = useSwapQuoteQuery();

  return useStateDependentQuery({
    state: {
      fromCoinBalance: fromCoinBalanceQuery.data,
      swapQuote: swapQuoteQuery.data,
      fromAmount: fromAmount ?? undefined,
    },
    getQuery: ({ fromCoinBalance, swapQuote }) => {
      const input: GetChainSpecificInput = {
        coin: fromCoin,
        sendMaxAmount:
          fromAmount ===
          fromChainAmount(fromCoinBalance.amount, fromCoin.decimals),
      };

      if ('native' in swapQuote) {
        const { swapChain } = swapQuote.native;
        const nativeFeeCoin = getCoinMetaKey(getChainFeeCoin(swapChain));

        input.isDeposit = areEqualCoins(fromCoinKey, nativeFeeCoin);
      }

      return {
        queryKey: getChainSpecificQueryKey(input),
        queryFn: () => getChainSpecific(input),
      };
    },
  });
};
