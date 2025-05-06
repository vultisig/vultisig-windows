import { currentVaultIdQueryKey } from '@core/ui/query/keys'
import { SetCurrentVaultIdFunction } from '@core/ui/storage/CoreStorage'
import {
  CurrentVaultId,
  initialCurrentVaultId,
} from '@core/ui/storage/currentVaultId'

import { getPersistentState } from '../../state/persistent/getPersistentState'
import { setPersistentState } from '../../state/persistent/setPersistentState'

const [key] = currentVaultIdQueryKey

export const setCurrentVaultId: SetCurrentVaultIdFunction = async value => {
  await setPersistentState(key, value)
}

export const getCurrentVaultId = (): Promise<CurrentVaultId> => {
  return getPersistentState(key, initialCurrentVaultId)
}
