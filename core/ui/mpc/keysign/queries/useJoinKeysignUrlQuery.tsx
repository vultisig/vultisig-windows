import {
  getJoinKeysignUrl,
  GetJoinKeysignUrlInput,
} from '@core/chain/utils/getJoinKeysignUrl'
import { useCurrentHexEncryptionKey } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { useMpcServerType } from '@core/ui/mpc/state/mpcServerType'
import { useMpcServiceName } from '@core/ui/mpc/state/mpcServiceName'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

export const useJoinKeysignUrlQuery = () => {
  const sessionId = useMpcSessionId()
  const [serverType] = useMpcServerType()
  const serviceName = useMpcServiceName()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const { keysignPayload } = useCorePathState<'keysign'>()
  const currentVault = useCurrentVault()
  const vaultId = getVaultId(currentVault)

  const input: GetJoinKeysignUrlInput = useMemo(
    () => ({
      serverType,
      serviceName,
      sessionId,
      hexEncryptionKey,
      payload: keysignPayload,
      vaultId,
    }),
    [
      hexEncryptionKey,
      keysignPayload,
      serverType,
      serviceName,
      sessionId,
      vaultId,
    ]
  )

  return useQuery({
    queryKey: ['joinKeysignUrl', input],
    queryFn: async () => getJoinKeysignUrl(input),
    meta: {
      disablePersist: true,
    },
  })
}
