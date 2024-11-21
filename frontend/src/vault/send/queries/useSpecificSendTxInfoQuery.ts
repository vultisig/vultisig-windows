import { useQuery } from '@tanstack/react-query';

import { AccountCoinKey } from '../../../coin/AccountCoin';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { ServiceFactory } from '../../../services/ServiceFactory';
import {
  useCurrentVaultAddress,
  useCurrentVaultCoin,
} from '../../state/currentVault';
import { useFeeSettings } from '../fee/settings/state/feeSettings';
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
  const [settings] = useFeeSettings();

  return useQuery({
    queryKey: getSpecificSendTxInfoQueryKey({
      ...coinKey,
      address,
    }),
    queryFn: async () => {
      const service = ServiceFactory.getService(coinKey.chainId, walletCore);
      if (settings) {
        return service.rpcService.getSpecificTransactionInfo(
          storageCoinToCoin(coin),
          settings.priority
        );
      }
      return service.rpcService.getSpecificTransactionInfo(
        storageCoinToCoin(coin)
      );
    },
  });
};
