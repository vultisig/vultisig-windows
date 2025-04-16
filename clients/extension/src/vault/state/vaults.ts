import { vaultsQueryKey } from '@core/ui/query/keys'
import { Vault } from '@core/ui/vault/Vault'

import { usePersistentStateMutation } from '../../state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '../../state/persistent/usePersistentStateQuery'

export const useVaultsQuery = () => {
  return usePersistentStateQuery<Vault[]>(vaultsQueryKey, [])
}

export const useVaultsMutation = () => {
  return usePersistentStateMutation<Vault[]>(vaultsQueryKey)
}
