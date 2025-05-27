import { SetCurrentVaultIdFunction } from '@core/ui/storage/CoreStorage'
import {
  CurrentVaultId,
  initialCurrentVaultId,
} from '@core/ui/storage/currentVaultId'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { getPersistentState } from '../../state/persistent/getPersistentState'
import { setPersistentState } from '../../state/persistent/setPersistentState'

export const setCurrentVaultId: SetCurrentVaultIdFunction = async value => {
  await setPersistentState(StorageKey.currentVaultId, value)
}

export const getCurrentVaultId = (): Promise<CurrentVaultId> => {
  return getPersistentState(StorageKey.currentVaultId, initialCurrentVaultId)
}
