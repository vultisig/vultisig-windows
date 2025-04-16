import { PersistentStateKey } from '../../state/persistent/PersistentStateKey'
import { usePersistentStateMutation } from '../../state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '../../state/persistent/usePersistentStateQuery'

export const useCurrentVaultIdQuery = () => {
  return usePersistentStateQuery<string | null>(
    PersistentStateKey.CurrentVaultId,
    null
  )
}

export const useCurrentVaultIdMutation = () => {
  return usePersistentStateMutation<string | null>(
    PersistentStateKey.CurrentVaultId
  )
}
