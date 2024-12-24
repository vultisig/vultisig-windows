import { useQuery } from '@tanstack/react-query';

import { getPreSigningHashes } from '../../../../chain/tx/utils/getPreSigningHashes';
import { useAssertWalletCore } from '../../../../providers/WalletCoreProvider';
import { useKeysignPayload } from '../../shared/state/keysignPayload';
import { getKeysignChain } from '../../utils/getKeysignChain';
import { getTxInputData } from '../../utils/getTxInputData';

export const useKeysignMsgsQuery = () => {
  const walletCore = useAssertWalletCore();

  const keysignPayload = useKeysignPayload();

  return useQuery({
    queryKey: ['keysignMsgs', keysignPayload],
    queryFn: async () => {
      const txInputData = await getTxInputData({
        keysignPayload,
        walletCore,
      });

      return txInputData.flatMap(txInputData =>
        getPreSigningHashes({
          txInputData,
          walletCore,
          chain: getKeysignChain(keysignPayload),
        })
      );
    },
    meta: {
      disablePersist: true,
    },
  });
};
