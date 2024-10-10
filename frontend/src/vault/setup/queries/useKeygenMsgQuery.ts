import { useQuery } from '@tanstack/react-query';

import { createKeygenMsg } from '../../../utils/QRGen';
import { useCurrentSessionId } from '../../keygen/shared/state/currentSessionId';
import { useCurrentServerType } from '../../keygen/state/currentServerType';
import { useCurrentHexChainCode } from '../state/currentHexChainCode';
import { useCurrentHexEncryptionKey } from '../state/currentHexEncryptionKey';
import { useCurrentServiceName } from '../state/currentServiceName';
import { useVaultName } from '../state/vaultName';

export const useKeygenMsgQuery = () => {
  const sessionId = useCurrentSessionId();
  const [serverType] = useCurrentServerType();
  const [vaultName] = useVaultName();
  const serviceName = useCurrentServiceName();
  const hexEncryptionKey = useCurrentHexEncryptionKey();
  const hexChainCode = useCurrentHexChainCode();

  return useQuery({
    queryKey: [
      'keygenMsg',
      serverType,
      vaultName,
      serviceName,
      sessionId,
      hexEncryptionKey,
      hexChainCode,
    ],
    queryFn: () =>
      createKeygenMsg(
        serverType === 'relay',
        vaultName,
        serviceName,
        sessionId,
        hexEncryptionKey,
        hexChainCode
      ),
    meta: {
      disablePersist: true,
    },
  });
};
