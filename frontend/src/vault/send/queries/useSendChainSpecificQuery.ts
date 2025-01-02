import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { getChainSpecificQueryKey } from '../../../coin/query/useChainSpecificQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useStateDependentQuery } from '../../../lib/ui/query/hooks/useStateDependentQuery';
import { Chain } from '../../../model/chain';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { GetChainSpecificInput } from '../../../services/Rpc/IRpcService';
import { ServiceFactory } from '../../../services/ServiceFactory';
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

  const fromCoinBalanceQuery = useBalanceQuery(storageCoinToCoin(coin));

  const walletCore = useAssertWalletCore();

  const [amount] = useSendAmount();

  return useStateDependentQuery({
    state: {
      fromCoinBalance: fromCoinBalanceQuery.data,
      amount: amount ?? undefined,
    },
    getQuery: ({ fromCoinBalance, amount }) => {
      const input: GetChainSpecificInput = {
        coin: storageCoinToCoin(coin),
        receiver,
        feeSettings,
        sendMaxAmount:
          amount === fromChainAmount(fromCoinBalance.amount, coin.decimals),
      };

      return {
        queryKey: getChainSpecificQueryKey(input),
        queryFn: async () => {
          const service = ServiceFactory.getService(
            input.coin.chain as Chain,
            walletCore
          );
          return service.rpcService.getChainSpecific(input);
        },
      };
    },
  });
};
