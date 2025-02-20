import { isEmpty } from '@lib/utils/array/isEmpty'
import { Dispatch, SetStateAction, useCallback } from 'react'

import { useStateCorrector } from '../../lib/ui/state/useStateCorrector'
import {
  PersistentStateKey,
  usePersistentState,
} from '../../state/persistentState'
import { useVaults } from '../queries/useVaultsQuery'
import { getStorageVaultId } from '../utils/storageVault'

export const useCurrentVaultId = (): [
  string | null,
  Dispatch<SetStateAction<string | null>>,
] => {
  const vaults = useVaults()

  const getInitialVaultId = useCallback(() => {
    if (isEmpty(vaults)) return null
    return getStorageVaultId(vaults[0])
  }, [vaults])

  const [currentVaultId, setCurrentVaultId] = useStateCorrector(
    usePersistentState<string | null>(
      PersistentStateKey.CurrentVaultId,
      getInitialVaultId
    ),
    (id: string | null) => {
      const vault = vaults.find(vault => getStorageVaultId(vault) === id)

      return vault ? id : getInitialVaultId()
    }
  )

  return [currentVaultId, setCurrentVaultId]
}
