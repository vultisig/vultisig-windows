import { useQuery } from '@tanstack/react-query';

import { useCurrentServiceName } from '../../../keygen/shared/state/currentServiceName';
import { useCurrentSessionId } from '../../../keygen/shared/state/currentSessionId';
import { useCurrentServerType } from '../../../keygen/state/currentServerType';
import {
  getJoinKeygenUrl,
  GetJoinKeygenUrlInput,
} from '../../../keygen/utils/getJoinKeygenUrl';
import { useCurrentHexChainCode } from '../../state/currentHexChainCode';
import { useCurrentHexEncryptionKey } from '../../state/currentHexEncryptionKey';
import { useVaultName } from '../../state/vaultName';

export const useJoinKeygenUrlQuery = () => {
  const sessionId = useCurrentSessionId();
  const [serverType] = useCurrentServerType();
  const [vaultName] = useVaultName();
  const serviceName = useCurrentServiceName();
  const hexEncryptionKey = useCurrentHexEncryptionKey();
  const hexChainCode = useCurrentHexChainCode();

  const input: GetJoinKeygenUrlInput = {
    sessionId,
    serverType,
    vaultName,
    serviceName,
    hexEncryptionKey,
    hexChainCode,
  };

  return useQuery({
    queryKey: ['joinKeygenUrl', input],
    queryFn: () => getJoinKeygenUrl(input),
    meta: {
      disablePersist: true,
    },
  });
};
