import { StorageKey } from '@core/ui/storage/StorageKey'
import { Vault } from '@core/ui/vault/Vault'

import { getPersistentState } from '../../state/persistent/getPersistentState'
import { setPersistentState } from '../../state/persistent/setPersistentState'

const initialValue: Vault[] = []

export const getVaults = async () =>
  getPersistentState(StorageKey.vaults, initialValue)

export const updateVaults = async (vaults: Vault[]) => {
  await setPersistentState(StorageKey.vaults, vaults)
}
