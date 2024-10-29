import { useQuery } from '@tanstack/react-query';

import { AccountCoinKey } from '../../../coin/AccountCoin';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { ServiceFactory } from '../../../services/ServiceFactory';
import {
  useAssertCurrentVaultAddress,
  useAssertCurrentVaultCoin,
} from '../../state/useCurrentVault';
import { useCurrentSendCoin } from '../state/sendCoin';

export const getSpecificSendTxInfoQueryKey = (coinKey: AccountCoinKey) => [
  'specificSendTxInfo',
  coinKey,
];

export const useSpecificSendTxInfoQuery = () => {
  const walletCore = useAssertWalletCore();
  const [coinKey] = useCurrentSendCoin();
  const coin = useAssertCurrentVaultCoin(coinKey);
  const address = useAssertCurrentVaultAddress(coinKey.chainId);

  return useQuery({
    queryKey: getSpecificSendTxInfoQueryKey({
      ...coinKey,
      address,
    }),
    queryFn: async () => {
      const service = ServiceFactory.getService(coinKey.chainId, walletCore);
      return service.feeService.getFee(storageCoinToCoin(coin));
    },
  });
};
