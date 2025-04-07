import {
  getJoinKeysignUrl,
  GetJoinKeysignUrlInput,
} from '@core/chain/utils/getJoinKeysignUrl'
import { useKeygenVault } from '@core/ui/mpc/keygen/state/keygenVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useMpcServerType } from '../../../../mpc/serverType/state/mpcServerType'
import { useMpcSessionId } from '../../../../mpc/session/state/mpcSession'
import { useCurrentServiceName } from '../../../keygen/shared/state/currentServiceName'
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey'
import { useKeysignMessagePayload } from '../state/keysignMessagePayload'

export const useJoinKeysignUrlQuery = () => {
  const sessionId = useMpcSessionId()
  const [serverType] = useMpcServerType()
  const serviceName = useCurrentServiceName()
  const hexEncryptionKey = useCurrentHexEncryptionKey()
  const payload = useKeysignMessagePayload()
  const keygenVault = useKeygenVault()
  const vaultId = getVaultId(getRecordUnionValue(keygenVault, 'existingVault'))

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
