import { useQuery } from '@tanstack/react-query';

import { useCurrentServiceName } from '../../keygen/shared/state/currentServiceName';
import { useCurrentSessionId } from '../../keygen/shared/state/currentSessionId';
import { useCurrentServerType } from '../../keygen/state/currentServerType';
import {
  getJoinReshareUrl,
  GetJoinReshareUrlInput,
} from '../../keygen/utils/getJoinReshareUrl';
import { useCurrentHexChainCode } from '../../setup/state/currentHexChainCode';
import { useCurrentHexEncryptionKey } from '../../setup/state/currentHexEncryptionKey';
import { useVaultName } from '../../setup/state/vaultName';
import { useAssertCurrentVault } from '../../state/useCurrentVault';

export const useJoinReshareUrlQuery = () => {
  const sessionId = useCurrentSessionId();
  const [serverType] = useCurrentServerType();
  const [vaultName] = useVaultName();
  const serviceName = useCurrentServiceName();
  const hexEncryptionKey = useCurrentHexEncryptionKey();
  const hexChainCode = useCurrentHexChainCode();
  const { signers, reshare_prefix, public_key_ecdsa } = useAssertCurrentVault();

  const input: GetJoinReshareUrlInput = {
    sessionId,
    serverType,
    vaultName,
    serviceName,
    hexEncryptionKey,
    hexChainCode,
    oldParties: signers,
    oldResharePrefix: reshare_prefix,
    publicKeyEcdsa: public_key_ecdsa,
  };

  return useQuery({
    queryKey: ['joinReshareUrl', input],
    queryFn: () => getJoinReshareUrl(input),
    meta: {
      disablePersist: true,
    },
  });
};
