import { usePersistentStateMutation } from '@clients/extension/src/state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '@clients/extension/src/state/persistent/usePersistentStateQuery'
import { Chain } from '@core/chain/Chain'
import { defaultChains } from '@core/ui/chain/state/defaultChains'
import { PersistentStateKey } from '@core/ui/state/PersistentStateKey'

export const useDefaultChains = () => {
  const { data = defaultChains } = usePersistentStateQuery<Chain[]>(
    PersistentStateKey.DefaultChains,
    defaultChains
  )

  const { mutate: setDefaultChains } = usePersistentStateMutation<Chain[]>(
    PersistentStateKey.DefaultChains
  )

  return [data, setDefaultChains] as const
}
