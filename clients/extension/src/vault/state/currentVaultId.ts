import { getVaultId } from '@core/ui/vault/Vault'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { useCallback, useEffect, useState } from 'react'

import { usePersistentStateMutation } from '../../state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '../../state/persistent/usePersistentStateQuery'
import { getVaults } from './vaults'

const key = 'currentVaultId'

export const useCurrentVaultIdMutation = () => {
  return usePersistentStateMutation<string | null>(key)
}

export const useCurrentVaultId = (): [
  string | null,
  (value: string | null) => void,
  boolean,
] => {
  const { data: storedVaultId = null } = usePersistentStateQuery<string | null>(
    key,
    null
  )
  const { mutate } = usePersistentStateMutation<string | null>(key)

  const [currentVaultId, setCurrentVaultId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const correctVaultId = useCallback(async () => {
    const vaults = await getVaults()
    if (isEmpty(vaults)) {
      setCurrentVaultId(null)
      mutate(null)
      setLoading(false)
      return
    }

    const isValid = vaults.some(v => getVaultId(v) === storedVaultId)
    const fallbackVaultId = getVaultId(vaults[0])
    const finalVaultId = isValid ? storedVaultId : fallbackVaultId

    setCurrentVaultId(finalVaultId)
    mutate(finalVaultId)
    setLoading(false)
  }, [storedVaultId, mutate])

  useEffect(() => {
    let cancelled = false
    correctVaultId().then(() => {
      if (cancelled) return
    })
    return () => {
      cancelled = true
    }
  }, [correctVaultId])

  return [currentVaultId, mutate, loading]
}
