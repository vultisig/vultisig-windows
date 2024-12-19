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
  receiver: string;
  feeSettings?: any;
};

type SpecificTxInfoQueryKeyParams = {
  coin: AccountCoinKey;
  feeSettings?: any;
  receiver: string;
};

export const getSpecificTxInfoQueryKey = ({
  coin,
  feeSettings,
  receiver,
}: SpecificTxInfoQueryKeyParams) =>
  withoutUndefined(['specificSendTxInfo', coin, receiver, feeSettings]);

export const useSpecificTxInfoQuery = ({
  coin,
  feeSettings,
  receiver,
}: SpecificTxInfoQueryParams) => {
  const walletCore = useAssertWalletCore();

  return useQuery({
    queryKey: getSpecificTxInfoQueryKey({
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
