import { useQuery } from '@tanstack/react-query';

import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { ServiceFactory } from '../../../services/ServiceFactory';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { useCurrentSwapCoin } from '../state/swapCoin';

export const useSpecificSendTxInfoQuery = () => {
  const walletCore = useAssertWalletCore();
  const [coinKey] = useCurrentSwapCoin();
  const coin = useCurrentVaultCoin(coinKey);

  return useQuery({
    queryKey: ['specificSendTxInfo', coinKey],
    queryFn: async () => {
      const service = ServiceFactory.getService(coinKey.chainId, walletCore);
      return service.rpcService.getSpecificTransactionInfo(
        storageCoinToCoin(coin)
      );
    },
  });
};
