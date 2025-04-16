import { PersistentStateKey } from '../../state/persistent/PersistentStateKey'
import { usePersistentStateMutation } from '../../state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '../../state/persistent/usePersistentStateQuery'

const queryKey: PersistentStateKey = ['currentVaultId']

export const useCurrentVaultIdQuery = () => {
  return usePersistentStateQuery<string | null>(queryKey, null)
}

export const useCurrentVaultIdMutation = () => {
  return usePersistentStateMutation<string | null>(queryKey)
}
