import { useVaults } from '@core/ui/vault/state/vaults'
import { getVaultId } from '@core/ui/vault/Vault'
import { useStateCorrector } from '@lib/ui/state/useStateCorrector'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { Dispatch, SetStateAction, useCallback } from 'react'

import {
  PersistentStateKey,
  usePersistentState,
} from '../../state/persistentState'

export const useCurrentVaultId = (): [
  string | null,
  Dispatch<SetStateAction<string | null>>,
] => {
  const vaults = useVaults()

  const getInitialVaultId = useCallback(() => {
    if (isEmpty(vaults)) return null
    return getVaultId(vaults[0])
  }, [vaults])

  const [currentVaultId, setCurrentVaultId] = useStateCorrector(
    usePersistentState<string | null>(
      PersistentStateKey.CurrentVaultId,
      getInitialVaultId
    ),
    (id: string | null) => {
      const vault = vaults.find(vault => getVaultId(vault) === id)

      return vault ? id : getInitialVaultId()
    }
  )

  return [currentVaultId, setCurrentVaultId]
}
