import { usePersistentStateMutation } from '@clients/extension/src/state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '@clients/extension/src/state/persistent/usePersistentStateQuery'
import { PersistentStateKey } from '@core/ui/state/PersistentStateKey'
import { useVaults } from '@core/ui/vault/state/vaults'
import { getVaultId } from '@core/ui/vault/Vault'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { useEffect, useState } from 'react'

export const useCurrentVaultIdMutation = () => {
  return usePersistentStateMutation<string | null>(
    PersistentStateKey.CurrentVaultId
  )
}

export const useCurrentVaultId = (): [
  string | null,
  (value: string | null) => void,
  boolean,
  boolean,
] => {
  const vaults = useVaults()
  const { data: storedVaultId = null } = usePersistentStateQuery<string | null>(
    PersistentStateKey.CurrentVaultId,
    null
  )
  const { mutate } = usePersistentStateMutation<string | null>(
    PersistentStateKey.CurrentVaultId
  )

  const [currentVaultId, setCurrentVaultId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!vaults) return

    if (isEmpty(vaults)) {
      setCurrentVaultId(null)
      mutate(null)
      setReady(true)
      return
    }

    const isValid = vaults.some(v => getVaultId(v) === storedVaultId)
    const fallbackVaultId = getVaultId(vaults[0])
    const finalVaultId = isValid ? storedVaultId : fallbackVaultId

    setCurrentVaultId(finalVaultId)
    mutate(finalVaultId)
    setReady(true)
  }, [vaults, storedVaultId, mutate])

  const loading = vaults === undefined

  return [currentVaultId, mutate, loading, ready]
}
