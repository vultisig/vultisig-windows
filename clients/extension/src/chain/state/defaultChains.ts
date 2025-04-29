import { defaultChainsQueryKey } from '@core/ui/query/keys'
import { SetDefaultChainsFunction } from '@core/ui/state/storage'
import { initialDefaultChains } from '@core/ui/vault/state/defaultChains'

import { getPersistentState } from '../../state/persistent/getPersistentState'
import { setPersistentState } from '../../state/persistent/setPersistentState'

const [key] = defaultChainsQueryKey

export const getDefaultChains = async () =>
  getPersistentState(key, initialDefaultChains)

export const setDefaultChains: SetDefaultChainsFunction = async chains => {
  await setPersistentState(key, chains)
}
