import {
  getJoinKeysignUrl,
  GetJoinKeysignUrlInput,
} from '@core/chain/utils/getJoinKeysignUrl'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useMpcServerType } from '../../../../mpc/serverType/state/mpcServerType'
import { useMpcSessionId } from '../../../../mpc/session/state/mpcSession'
import { useCurrentServiceName } from '../../../keygen/shared/state/currentServiceName'
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey'
import { useCurrentVault } from '../../../state/currentVault'
import { getStorageVaultId } from '../../../utils/storageVault'
import { useKeysignMessagePayload } from '../state/keysignMessagePayload'

export const useJoinKeysignUrlQuery = () => {
  const sessionId = useMpcSessionId()
  const [serverType] = useMpcServerType()
  const serviceName = useCurrentServiceName()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const payload = useKeysignMessagePayload()
  const vault = useCurrentVault()

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
  )

  return useQuery({
    queryKey: ['joinKeysignUrl', input],
    queryFn: async () => getJoinKeysignUrl(input),
    meta: {
      disablePersist: true,
    },
  })
}
