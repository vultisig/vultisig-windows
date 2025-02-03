import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useCurrentSessionId } from '../../../keygen/shared/state/currentSessionId';
import { useCurrentServerUrl } from '../../../keygen/state/currentServerUrl';
import { startSession } from '../../../keygen/utils/startSession';
import { useVaultKeygenDevices } from '../../hooks/useVaultKegenDevices';

export const useStartFastVaultKeygenSessionMutation = (enabled: boolean) => {
  const sessionId = useCurrentSessionId();
  const serverUrl = useCurrentServerUrl();
  const devices = useVaultKeygenDevices();

  const { mutate: start, ...state } = useMutation({
    mutationFn: () => {
      return startSession({ serverUrl, sessionId, devices });
    },
  });

  useEffect(() => {
    if (enabled) start();
  }, [enabled, start]);

  return state;
};
