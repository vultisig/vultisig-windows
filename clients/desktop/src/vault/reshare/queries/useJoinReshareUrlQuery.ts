import { useQuery } from '@tanstack/react-query'

import { useMpcServerType } from '../../../mpc/serverType/state/mpcServerType'
import { useCurrentServiceName } from '../../keygen/shared/state/currentServiceName'
import { useCurrentSessionId } from '../../keygen/shared/state/currentSessionId'
import {
  getJoinReshareUrl,
  GetJoinReshareUrlInput,
} from '../../keygen/utils/getJoinReshareUrl'
import { useCurrentHexChainCode } from '../../setup/state/currentHexChainCode'
import { useCurrentHexEncryptionKey } from '../../setup/state/currentHexEncryptionKey'
import { useCurrentVault } from '../../state/currentVault'

export const useJoinReshareUrlQuery = () => {
  const sessionId = useCurrentSessionId()
  const [serverType] = useMpcServerType()
  const serviceName = useCurrentServiceName()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const hexChainCode = useCurrentHexChainCode()
  const { signers, reshare_prefix, public_key_ecdsa, name, lib_type } =
    useCurrentVault()
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
    libType: lib_type,
  }

  return useQuery({
    queryKey: ['joinReshareUrl', input],
    queryFn: () => getJoinReshareUrl(input),
    meta: {
      disablePersist: true,
    },
  })
}
