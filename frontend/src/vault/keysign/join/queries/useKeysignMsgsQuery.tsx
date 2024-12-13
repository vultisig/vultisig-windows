import { useQuery } from '@tanstack/react-query';

import { useAssertWalletCore } from '../../../../providers/WalletCoreProvider';
import { useKeysignPayload } from '../../shared/state/keysignPayload';
import { getPreSignedImageHashes } from '../../utils/getPreSignedImageHashes';

export const useKeysignMsgsQuery = () => {
  const walletCore = useAssertWalletCore();

  const keysignPayload = useKeysignPayload();

  return useQuery({
    queryKey: ['keysignMsgs', keysignPayload],
    queryFn: async () =>
      getPreSignedImageHashes({
        keysignPayload,
        walletCore,
      }),
    meta: {
      disablePersist: true,
    },
  });
};
