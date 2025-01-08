import { getFeeAmount } from '../../../chain/tx/fee/utils/getFeeAmount';
import { toChainAmount } from '../../../chain/utils/toChainAmount';
import { CoinAmount } from '../../../coin/Coin';
import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useTransform } from '../../../lib/ui/hooks/useTransform';
import { useStateDependentQuery } from '../../../lib/ui/query/hooks/useStateDependentQuery';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { useSendChainSpecificQuery } from '../queries/useSendChainSpecificQuery';
import { useSendAmount } from '../state/amount';
import { useCurrentSendCoin } from '../state/sendCoin';
import { capSendAmountToMax } from '../utils/capSendAmountToMax';

export const useSendCappedAmountQuery = () => {
  const [coinKey] = useCurrentSendCoin();
  const coin = useTransform(useCurrentVaultCoin(coinKey), storageCoinToCoin);
  const [amount] = useSendAmount();

  const chainSpecificQuery = useSendChainSpecificQuery();
  const balanceQuery = useBalanceQuery(coin);

  return useStateDependentQuery({
    state: {
      chainSpecific: chainSpecificQuery.data,
      balance: balanceQuery.data,
    },
    getQuery: ({ chainSpecific, balance }) => ({
      queryKey: ['sendCappedAmount'],
      queryFn: async (): Promise<CoinAmount> => {
        const { decimals } = coin;

        const chainAmount = toChainAmount(shouldBePresent(amount), decimals);

        const feeAmount = getFeeAmount(chainSpecific);

        return {
          decimals,
          amount: capSendAmountToMax({
            amount: chainAmount,
            coin,
            fee: feeAmount,
            balance: balance.amount,
          }),
        };
      },
    }),
  });
};
