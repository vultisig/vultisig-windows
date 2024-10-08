import { useQuery } from '@tanstack/react-query';

import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { ServiceFactory } from '../../../services/ServiceFactory';
import { useAssertCurrentVaultCoin } from '../../state/useCurrentVault';
import { useCurrentSendCoin } from '../state/sendCoin';

export const useSpecificSendTxInfoQuery = () => {
  const walletCore = useAssertWalletCore();
  const [coinKey] = useCurrentSendCoin();
  const coin = useAssertCurrentVaultCoin(coinKey);

  return useQuery({
    queryKey: ['specificSendTxInfo', coinKey],
    queryFn: async () => {
      const service = ServiceFactory.getService(coinKey.chainId, walletCore);
      return service.feeService.getFee(new Coin(coin));
    },
  });
};
