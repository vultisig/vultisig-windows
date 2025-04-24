import { useVaults } from '@core/ui/vault/state/vaults'
import { getVaultId } from '@core/ui/vault/Vault'
import { isEmpty } from '@lib/utils/array/isEmpty'

import { usePersistentStateMutation } from '../../state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '../../state/persistent/usePersistentStateQuery'

const key = 'currentVaultId'

export const useCurrentVaultIdMutation = () => {
  return usePersistentStateMutation<string | null>(key)
}

export const useCurrentVaultId = () => {
  const vaults = useVaults()
  const { data: storedVaultId = null } = usePersistentStateQuery<string | null>(
    key,
    null
  )

  const { mutate } = usePersistentStateMutation<string | null>(key)

  const isValid = vaults.some(v => getVaultId(v) === storedVaultId)
  const fallbackVaultId = !isEmpty(vaults) ? getVaultId(vaults[0]) : null

  const currentVaultId = isValid ? storedVaultId : fallbackVaultId

  return [currentVaultId, mutate] as const
}
