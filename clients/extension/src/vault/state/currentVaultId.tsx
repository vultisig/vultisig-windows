import { currentVaultIdQueryKey } from '@core/ui/query/keys'
import {
  GetCurrentVaultIdFunction,
  SetCurrentVaultIdFunction,
} from '@core/ui/state/storage'
import { initialCurrentVaultId } from '@core/ui/vault/state/currentVaultId'

import { getPersistentState } from '../../state/persistent/getPersistentState'
import { setPersistentState } from '../../state/persistent/setPersistentState'

const [key] = currentVaultIdQueryKey

export const setCurrentVaultId: SetCurrentVaultIdFunction = async value => {
  await setPersistentState(key, value)
}

export const getCurrentVaultId: GetCurrentVaultIdFunction = async () => {
  return getPersistentState(key, initialCurrentVaultId)
}
