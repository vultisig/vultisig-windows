import { useQuery } from '@tanstack/react-query';

import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { withoutUndefined } from '../../lib/utils/array/withoutUndefined';
import { Chain } from '../../model/chain';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { ServiceFactory } from '../../services/ServiceFactory';
import { AccountCoinKey } from '../AccountCoin';
import { getCoinKey } from '../utils/coin';

type SpecificTxInfoQueryParams = {
  coin: Coin;
  feeSettings?: any;
};

type SpecificTxInfoQueryKeyParams = {
  coin: AccountCoinKey;
  feeSettings?: any;
};

export const getSpecificTxInfoQueryKey = ({
  coin,
  feeSettings,
}: SpecificTxInfoQueryKeyParams) =>
  withoutUndefined(['specificSendTxInfo', coin, feeSettings]);

export const useSpecificTxInfoQuery = ({
  coin,
  feeSettings,
}: SpecificTxInfoQueryParams) => {
  const walletCore = useAssertWalletCore();

  return useQuery({
    queryKey: getSpecificTxInfoQueryKey({
      coin: getCoinKey(coin),
      feeSettings,
    }),
    queryFn: async () => {
      const service = ServiceFactory.getService(
        coin.chain as Chain,
        walletCore
      );
      return service.rpcService.getSpecificTransactionInfo(coin, feeSettings);
    },
  });
};
