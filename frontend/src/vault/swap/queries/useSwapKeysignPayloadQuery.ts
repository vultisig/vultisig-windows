import { useQuery } from '@tanstack/react-query';

import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';

export const useSwapKeysignPayloadQuery = () => {
  return useQuery({
    queryKey: ['swapKeysignPayload'],
    queryFn: async () => {
      return new KeysignPayload();
    },
  });
};
