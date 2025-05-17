import { defaultChainsQueryKey } from '@core/ui/query/keys'
import { initialDefaultChains } from '@core/ui/vault/state/defaultChains'

import { getPersistentState } from '../../state/persistent/getPersistentState'

const [key] = defaultChainsQueryKey

export const getDefaultChains = async () =>
  getPersistentState(key, initialDefaultChains)
