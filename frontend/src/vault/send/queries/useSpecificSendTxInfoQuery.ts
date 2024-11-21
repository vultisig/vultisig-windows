import { useQuery } from '@tanstack/react-query';

import { AccountCoinKey } from '../../../coin/AccountCoin';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { ServiceFactory } from '../../../services/ServiceFactory';
import {
  useCurrentVaultAddress,
  useCurrentVaultCoin,
} from '../../state/currentVault';
import { useCurrentSendCoin } from '../state/sendCoin';

export const getSpecificSendTxInfoQueryKey = (coinKey: AccountCoinKey) => [
  'specificSendTxInfo',
  coinKey,
];

export const useSpecificSendTxInfoQuery = () => {
  const walletCore = useAssertWalletCore();
  const [coinKey] = useCurrentSendCoin();
  const coin = useCurrentVaultCoin(coinKey);
  const address = useCurrentVaultAddress(coinKey.chainId);

  return useQuery({
    queryKey: getSpecificSendTxInfoQueryKey({
      ...coinKey,
      address,
    }),
    queryFn: async () => {
      const service = ServiceFactory.getService(coinKey.chainId, walletCore);
      return service.rpcService.getSpecificTransactionInfo(
        storageCoinToCoin(coin)
      );
    },
  });
};
