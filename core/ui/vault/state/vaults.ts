import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'
import { useMemo } from 'react'

import { Vault } from '../Vault'

export const { useValue: useVaults, provider: VaultsProvider } =
  getValueProviderSetup<(Vault & { coins: AccountCoin[] })[]>('Vaults')

export const useFolderlessVaults = () => {
  const vaults = useVaults()

  return useMemo(() => vaults.filter(({ folderId }) => !folderId), [vaults])
}

export const useFolderVaults = (folderId: string) => {
  const vaults = useVaults()

  return useMemo(
    () => vaults.filter(vault => vault.folderId === folderId),
    [vaults, folderId]
  )
}

export const useVaultNames = () => {
  const vaults = useVaults()

  return useMemo(() => withoutDuplicates(vaults.map(v => v.name)), [vaults])
}

export const useVaultOrders = () => {
  const vaults = useVaults()

  return useMemo(() => vaults.map(v => v.order), [vaults])
}
