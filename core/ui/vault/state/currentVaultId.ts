import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { useCallback } from 'react'

import { getVaultId, Vault } from '../Vault'
import { useVaults } from './vaults'

export type CurrentVaultId = string | null

export const { useValue: useCurrentVaultId, provider: CurrentVaultIdProvider } =
  getValueProviderSetup<CurrentVaultId>('CurrentVaultId')

export const getInitialVaultId = (vaults: Vault[]): CurrentVaultId => {
  if (isEmpty(vaults)) return null

  return getVaultId(vaults[0])
}

export const useCurrentVaultIdCorrector = () => {
  const vaults = useVaults()

  return useCallback(
    (id: CurrentVaultId) => {
      const vault = vaults.find(vault => getVaultId(vault) === id)

      return vault ? id : getInitialVaultId(vaults)
    },
    [vaults]
  )
}
