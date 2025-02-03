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
import { useCurrentVault } from '../../state/currentVault';

export const useJoinReshareUrlQuery = () => {
  const sessionId = useCurrentSessionId();
  const [serverType] = useCurrentServerType();
  const serviceName = useCurrentServiceName();
  const hexEncryptionKey = useCurrentHexEncryptionKey();
  const hexChainCode = useCurrentHexChainCode();
  const { signers, reshare_prefix, public_key_ecdsa, name } = useCurrentVault();

  const input: GetJoinReshareUrlInput = {
    sessionId,
    serverType,
    vaultName: name,
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
