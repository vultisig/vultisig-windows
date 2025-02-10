import { UtxoChain } from '@core/chain/Chain';
import { isOneOf } from '@lib/utils/array/isOneOf';

import { getChainSpecific } from '../../../chain/keysign/chainSpecific/getChainSpecific';
import { GetChainSpecificInput } from '../../../chain/keysign/chainSpecific/GetChainSpecificInput';
import { getSwapKeysignPayloadFields } from '../../../chain/swap/keysign/getSwapKeysignPayloadFields';
import { toChainAmount } from '../../../chain/utils/toChainAmount';
import { chainFeeCoin } from '../../../coin/chainFeeCoin';
import { areEqualCoins } from '../../../coin/Coin';
import { getChainSpecificQueryKey } from '../../../coin/query/useChainSpecificQuery';
import { useStateDependentQuery } from '../../../lib/ui/query/hooks/useStateDependentQuery';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { useFromAmount } from '../state/fromAmount';
import { useFromCoin } from '../state/fromCoin';
import { useToCoin } from '../state/toCoin';
import { useSwapQuoteQuery } from './useSwapQuoteQuery';

export const useSwapChainSpecificQuery = () => {
  const [fromCoinKey] = useFromCoin();
  const fromCoin = useCurrentVaultCoin(fromCoinKey);

  const [toCoinKey] = useToCoin();
  const toCoin = useCurrentVaultCoin(toCoinKey);

  const [fromAmount] = useFromAmount();

  const swapQuoteQuery = useSwapQuoteQuery();

  return useStateDependentQuery({
    state: {
      swapQuote: swapQuoteQuery.data,
      fromAmount: fromAmount ?? undefined,
    },
    getQuery: ({ swapQuote, fromAmount }) => {
      const { toAddress } = getSwapKeysignPayloadFields({
        amount: toChainAmount(fromAmount, fromCoin.decimals),
        quote: swapQuote,
        fromCoin,
        toCoin: toCoin,
      });

      const input: GetChainSpecificInput = {
        coin: fromCoin,
        amount: fromAmount,
        receiver: toAddress,
      };

      if ('native' in swapQuote) {
        const { swapChain } = swapQuote.native;
        const nativeFeeCoin = chainFeeCoin[swapChain];

        input.isDeposit = areEqualCoins(fromCoinKey, nativeFeeCoin);
      }

      if (isOneOf(fromCoin.chain, Object.values(UtxoChain))) {
        input.feeSettings = {
          priority: 'fast',
        };
      }

      return {
        queryKey: getChainSpecificQueryKey(input),
        queryFn: () => getChainSpecific(input),
      };
    },
  });
};
