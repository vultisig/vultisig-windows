import { useMemo } from 'react';

import { KeysignMessage } from '../../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { shouldBePresent } from '../../../../lib/utils/assert/shouldBePresent';
import { useAppPathParams } from '../../../../navigation/hooks/useAppPathParams';

export const useCurrentJoinKeysignMsg = () => {
  const [{ keysignMsg: rawMsg }] = useAppPathParams<'joinKeysign'>();

  return useMemo(() => {
    return KeysignMessage.fromJsonString(rawMsg);
  }, [rawMsg]);
};

export const useCurrentJoinKeysignPayload = () => {
  const keysignMsg = useCurrentJoinKeysignMsg();

  return shouldBePresent(keysignMsg.keysignPayload);
};
