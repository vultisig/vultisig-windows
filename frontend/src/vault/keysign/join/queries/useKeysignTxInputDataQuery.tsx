import { useQuery } from '@tanstack/react-query';

import { useAssertWalletCore } from '../../../../providers/WalletCoreProvider';
import { useKeysignPayload } from '../../shared/state/keysignPayload';
import { getTxInputData } from '../../utils/getTxInputData';

export const useKeysignTxInputDataQuery = () => {
  const walletCore = useAssertWalletCore();

  const keysignPayload = useKeysignPayload();

  return useQuery({
    queryKey: ['keysignTxInputData', keysignPayload],
    queryFn: () =>
      getTxInputData({
        keysignPayload,
        walletCore,
      }),
    meta: {
      disablePersist: true,
    },
  });
};
