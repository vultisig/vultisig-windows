import { useQuery } from '@tanstack/react-query';

import { AccountCoinKey } from '../../../coin/AccountCoin';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { ServiceFactory } from '../../../services/ServiceFactory';
import {
  useAssertCurrentVaultAddress,
  useAssertCurrentVaultCoin,
} from '../../state/useCurrentVault';
import { useCurrentDepositCoin } from '../hooks/useCurrentDepositCoin';

export const getSpecificDepositTxInfoQueryKey = (coinKey: AccountCoinKey) => [
  'specificSendTxInfo',
  coinKey,
];

export const useSpecificDepositTxInfoQuery = () => {
  const walletCore = useAssertWalletCore();
  const [coinKey] = useCurrentDepositCoin();
  const coin = useAssertCurrentVaultCoin(coinKey);
  const address = useAssertCurrentVaultAddress(coinKey.chainId);

  return useQuery({
    queryKey: getSpecificDepositTxInfoQueryKey({
      ...coinKey,
      address,
    }),
    queryFn: async () => {
      const service = ServiceFactory.getService(coinKey.chainId, walletCore);
      return service.feeService.getFee(storageCoinToCoin(coin));
    },
  });
};
