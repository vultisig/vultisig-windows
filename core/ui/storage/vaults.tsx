import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { fixedDataQueryOptions } from '@lib/ui/query/utils/options'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { vaultsCoinsQueryKey, vaultsQueryKey } from '../query/keys'
import { useCoreStorage } from '../state/storage'
import { getVaultId, Vault } from '../vault/Vault'

type MergeVaultsWithCoinsInput = {
  vaults: Vault[]
  coins: Record<string, AccountCoin[]>
}

const mergeVaultsWithCoins = ({ vaults, coins }: MergeVaultsWithCoinsInput) => {
  return sortEntitiesWithOrder(vaults).map(vault => {
    const vaultCoins = coins[getVaultId(vault)] ?? []
    const vaultChains = vaultCoins.filter(isFeeCoin).map(coin => coin.chain)

    return {
      ...vault,
      coins: vaultCoins.filter(coin => vaultChains.includes(coin.chain)),
    }
  })
}

export const useVaultsQuery = () => {
  const { getVaults, getVaultsCoins } = useCoreStorage()

  const vaults = useQuery({
    queryKey: vaultsQueryKey,
    queryFn: getVaults,
    ...fixedDataQueryOptions,
  })

  const coins = useQuery({
    queryKey: vaultsCoinsQueryKey,
    queryFn: getVaultsCoins,
    ...fixedDataQueryOptions,
  })

  return useTransformQueriesData(
    {
      vaults,
      coins,
    },
    mergeVaultsWithCoins
  )
}

export const useVaults = () => {
  const { data } = useVaultsQuery()

  return shouldBePresent(data)
}

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
