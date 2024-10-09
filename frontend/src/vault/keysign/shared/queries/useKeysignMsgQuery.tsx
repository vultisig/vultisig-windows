import { useQuery } from '@tanstack/react-query';

import { createKeysignMessage } from '../../../../utils/QRGen';
import { useCurrentSessionId } from '../../../keygen/shared/state/currentSessionId';
import { useCurrentServerType } from '../../../keygen/state/currentServerType';
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey';
import { useCurrentServiceName } from '../../../setup/state/currentServiceName';
import { useAssertCurrentVault } from '../../../state/useCurrentVault';
import { getStorageVaultId } from '../../../utils/storageVault';
import { useKeysignPayload } from '../state/keysignPayload';

export const useKeysignMsgQuery = () => {
  const sessionId = useCurrentSessionId();
  const [serverType] = useCurrentServerType();
  const serviceName = useCurrentServiceName();
  const hexEncryptionKey = useCurrentHexEncryptionKey();
  const payload = useKeysignPayload();
  const vault = useAssertCurrentVault();

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
        serverType === 'relay',
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
