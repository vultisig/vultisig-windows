import { vaultsQueryKey } from '@core/ui/query/keys'
import { Vault } from '@core/ui/vault/Vault'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

import { getPersistentState } from '../../state/persistent/getPersistentState'
import { usePersistentStateMutation } from '../../state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '../../state/persistent/usePersistentStateQuery'

const initialValue: Vault[] = []

export const { useValue: useVaults, provider: VaultsProvider } =
  getValueProviderSetup<Vault[]>('Vaults')

const [key] = vaultsQueryKey

export const getVaults = async () => getPersistentState(key, initialValue)

export const useVaultsMutation = () => {
  return usePersistentStateMutation<Vault[]>(key)
}

export const useVaultsQuery = () => {
  return usePersistentStateQuery<Vault[]>(key, [])
}
