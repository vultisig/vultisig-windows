import {
  getJoinKeysignUrl,
  GetJoinKeysignUrlInput,
} from '@core/chain/utils/getJoinKeysignUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { getVaultId } from '@core/ui/vault/Vault'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useMpcServerType } from '../../../../mpc/serverType/state/mpcServerType'
import { useCurrentServiceName } from '../../../keygen/shared/state/currentServiceName'
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey'
import { useCurrentVault } from '../../../state/currentVault'
import { useKeysignMessagePayload } from '../state/keysignMessagePayload'

export const useJoinKeysignUrlQuery = () => {
  const sessionId = useMpcSessionId()
  const [serverType] = useMpcServerType()
  const serviceName = useCurrentServiceName()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const payload = useKeysignMessagePayload()
  const currentVault = useCurrentVault()
  const vaultId = getVaultId(currentVault)

  const input: GetJoinKeysignUrlInput = useMemo(
    () => ({
      serverType,
      serviceName,
      sessionId,
      hexEncryptionKey,
      payload,
      vaultId,
    }),
    [hexEncryptionKey, payload, serverType, serviceName, sessionId, vaultId]
  )

  return useQuery({
    queryKey: ['joinKeysignUrl', input],
    queryFn: async () => getJoinKeysignUrl(input),
    meta: {
      disablePersist: true,
    },
  })
}
