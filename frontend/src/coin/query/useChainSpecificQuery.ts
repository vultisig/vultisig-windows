import { useQuery } from '@tanstack/react-query';

import { withoutUndefined } from '../../lib/utils/array/withoutUndefined';
import { Chain } from '../../model/chain';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { GetChainSpecificInput } from '../../services/Rpc/IRpcService';
import { ServiceFactory } from '../../services/ServiceFactory';

export const chainSpecificQueryKeyPrefix = 'chainSpecific';

export const getChainSpecificQueryKey = (input: GetChainSpecificInput) =>
  withoutUndefined([chainSpecificQueryKeyPrefix, ...Object.values(input)]);

export const useChainSpecificQuery = (input: GetChainSpecificInput) => {
  const walletCore = useAssertWalletCore();

  return useQuery({
    queryKey: getChainSpecificQueryKey(input),
    queryFn: async () => {
      const service = ServiceFactory.getService(
        input.coin.chain as Chain,
        walletCore
      );
      return service.rpcService.getChainSpecific(input);
    },
  });
};
