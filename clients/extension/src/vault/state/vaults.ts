import { vaultsQueryKey } from '@core/ui/query/keys'
import { Vault } from '@core/ui/vault/Vault'

import { getPersistentState } from '../../state/persistent/getPersistentState'
import { setPersistentState } from '../../state/persistent/setPersistentState'
import { usePersistentStateQuery } from '../../state/persistent/usePersistentStateQuery'

const initialValue: Vault[] = []

const [key] = vaultsQueryKey

export const getVaults = async () => getPersistentState(key, initialValue)

export const updateVaults = async (vaults: Vault[]) => {
  await setPersistentState(key, vaults)
}

export const useVaultsQuery = () => {
  return usePersistentStateQuery<Vault[]>(key, [])
}
