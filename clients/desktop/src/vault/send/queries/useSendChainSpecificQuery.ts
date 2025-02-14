import { getChainSpecific } from '@core/keysign/chainSpecific';
import { ChainSpecificResolverInput } from '@core/keysign/chainSpecific/ChainSpecificResolver';

import { getChainSpecificQueryKey } from '../../../coin/query/useChainSpecificQuery';
import { useStateDependentQuery } from '../../../lib/ui/query/hooks/useStateDependentQuery';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { useFeeSettings } from '../fee/settings/state/feeSettings';
import { useSendAmount } from '../state/amount';
import { useSendReceiver } from '../state/receiver';
import { useCurrentSendCoin } from '../state/sendCoin';

export const useSendChainSpecificQuery = () => {
  const [coinKey] = useCurrentSendCoin();
  const coin = useCurrentVaultCoin(coinKey);
  const [feeSettings] = useFeeSettings();

  const [receiver] = useSendReceiver();

  const [amount] = useSendAmount();

  return useStateDependentQuery({
    state: {
      amount: amount ?? undefined,
    },
    getQuery: ({ amount }) => {
      const input: ChainSpecificResolverInput = {
        coin,
        receiver,
        feeSettings,
        amount,
      };

      return {
        queryKey: getChainSpecificQueryKey(input),
        queryFn: () => getChainSpecific(input),
      };
    },
  });
};
