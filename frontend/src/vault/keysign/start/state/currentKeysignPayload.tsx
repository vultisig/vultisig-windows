import { useMemo } from 'react';

import { KeysignPayload } from '../../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { useAppPathParams } from '../../../../navigation/hooks/useAppPathParams';

export const useCurrentKeysignPayload = () => {
  const [{ keysignPayload: rawPayload }] = useAppPathParams<'keysign'>();

  return useMemo(() => {
    return KeysignPayload.fromJsonString(rawPayload);
  }, [rawPayload]);
};
