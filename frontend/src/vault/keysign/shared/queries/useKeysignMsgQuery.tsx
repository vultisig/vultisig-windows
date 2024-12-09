import { useQuery } from '@tanstack/react-query';

import { createKeysignMessage } from '../../../../utils/QRGen';
import { useCurrentServiceName } from '../../../keygen/shared/state/currentServiceName';
import { useCurrentSessionId } from '../../../keygen/shared/state/currentSessionId';
import { useCurrentServerType } from '../../../keygen/state/currentServerType';
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey';
import { useCurrentVault } from '../../../state/currentVault';
import { getStorageVaultId } from '../../../utils/storageVault';
import { useKeysignPayload } from '../state/keysignPayload';

export const useKeysignMsgQuery = () => {
  const sessionId = useCurrentSessionId();
  const [serverType] = useCurrentServerType();
  const serviceName = useCurrentServiceName();
  const hexEncryptionKey = useCurrentHexEncryptionKey();
  const payload = useKeysignPayload();
  const vault = useCurrentVault();

  return useQuery({
    queryKey: [
      'keysignMsg',
      serverType,
      serviceName,
      sessionId,
      hexEncryptionKey,
      payload,
    ],
    queryFn: () =>
      createKeysignMessage(
        serverType,
        serviceName,
        sessionId,
        hexEncryptionKey,
        payload,
        getStorageVaultId(vault)
      ),
    meta: {
      disablePersist: true,
    },
  });
};
