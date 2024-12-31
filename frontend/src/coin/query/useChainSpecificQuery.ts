import { useQuery } from '@tanstack/react-query';

import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { withoutUndefined } from '../../lib/utils/array/withoutUndefined';
import { Chain } from '../../model/chain';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { ServiceFactory } from '../../services/ServiceFactory';
import { AccountCoinKey } from '../AccountCoin';
import { getCoinKey } from '../utils/coin';

type ChainSpecificQueryParams = {
  coin: Coin;
  receiver: string;
  feeSettings?: any;
};

type ChainSpecificQueryKeyParams = {
  coin: AccountCoinKey;
  feeSettings?: any;
  receiver: string;
};

export const getChainSpecificQueryKey = ({
  coin,
  feeSettings,
  receiver,
}: ChainSpecificQueryKeyParams) =>
  withoutUndefined(['chainSpecific', coin, receiver, feeSettings]);

export const useChainSpecificQuery = ({
  coin,
  feeSettings,
  receiver,
}: ChainSpecificQueryParams) => {
  const walletCore = useAssertWalletCore();

  return useQuery({
    queryKey: getChainSpecificQueryKey({
      coin: getCoinKey(coin),
      receiver,
      feeSettings,
    }),
    queryFn: async () => {
      const service = ServiceFactory.getService(
        coin.chain as Chain,
        walletCore
      );
      return service.rpcService.getSpecificTransactionInfo(
        coin,
        receiver,
        feeSettings
      );
    },
  });
};
