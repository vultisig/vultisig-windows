import { usePersistentStateMutation } from '../../state/persistent/usePersistentStateMutation'

const key = 'currentVaultId'

export const useCurrentVaultIdMutation = () => {
  return usePersistentStateMutation<string | null>(key)
}
