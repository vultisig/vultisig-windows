import { useQuery } from '@tanstack/react-query';

import { useCurrentServiceName } from '../../../keygen/shared/state/currentServiceName';
import { useCurrentSessionId } from '../../../keygen/shared/state/currentSessionId';
import { useCurrentServerType } from '../../../keygen/state/currentServerType';
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey';
import { useAssertCurrentVault } from '../../../state/useCurrentVault';
import { getStorageVaultId } from '../../../utils/storageVault';
import { useKeysignPayload } from '../state/keysignPayload';
import {
  getJoinKeysignUrl,
  GetJoinKeysignUrlInput,
} from '../utils/getJoinKeysignUrl';

export const useJoinKeysignUrlQuery = () => {
  const sessionId = useCurrentSessionId();
  const [serverType] = useCurrentServerType();
  const serviceName = useCurrentServiceName();
  const hexEncryptionKey = useCurrentHexEncryptionKey();
  const payload = useKeysignPayload();
  const vault = useAssertCurrentVault();

  const input: GetJoinKeysignUrlInput = {
    sessionId,
    serverType,
    serviceName,
    hexEncryptionKey,
    payload,
    vaultId: getStorageVaultId(vault),
  };

  return useQuery({
    queryKey: ['joinKeysignUrl', input],
    queryFn: () => getJoinKeysignUrl(input),
    meta: {
      disablePersist: true,
    },
  });
};
