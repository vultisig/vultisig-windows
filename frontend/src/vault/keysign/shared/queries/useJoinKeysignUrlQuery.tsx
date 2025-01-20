import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useCurrentServiceName } from '../../../keygen/shared/state/currentServiceName';
import { useCurrentSessionId } from '../../../keygen/shared/state/currentSessionId';
import { useCurrentServerType } from '../../../keygen/state/currentServerType';
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey';
import { useCurrentVault } from '../../../state/currentVault';
import { getStorageVaultId } from '../../../utils/storageVault';
import { useKeysignMessagePayload } from '../state/keysignMessagePayload';
import {
  getJoinKeysignUrl,
  GetJoinKeysignUrlInput,
} from '../utils/getJoinKeysignUrl';

export const useJoinKeysignUrlQuery = () => {
  const sessionId = useCurrentSessionId();
  const [serverType] = useCurrentServerType();
  const serviceName = useCurrentServiceName();
  const hexEncryptionKey = useCurrentHexEncryptionKey();
  const payload = useKeysignMessagePayload();
  const vault = useCurrentVault();

  const input: GetJoinKeysignUrlInput = useMemo(
    () => ({
      serverType,
      serviceName,
      sessionId,
      hexEncryptionKey,
      payload,
      vaultId: getStorageVaultId(vault),
    }),
    [serverType, serviceName, sessionId, hexEncryptionKey, payload, vault]
  );

  return useQuery({
    queryKey: ['joinKeysignUrl', input],
    queryFn: async () => getJoinKeysignUrl(input),
    meta: {
      disablePersist: true,
    },
  });
};
