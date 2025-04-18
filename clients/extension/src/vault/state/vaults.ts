import { vaultsQueryKey } from '@core/ui/query/keys'
import { Vault } from '@core/ui/vault/Vault'

import { getPersistentState } from '../../state/persistent/getPersistentState'
import { usePersistentStateMutation } from '../../state/persistent/usePersistentStateMutation'

const initialValue: Vault[] = []

const [key] = vaultsQueryKey

export const getVaults = async () => getPersistentState(key, initialValue)

export const useVaultsMutation = () => {
  return usePersistentStateMutation<Vault[]>(key)
}
