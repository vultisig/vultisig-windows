import { useIsCircleVisible } from '@core/ui/storage/circleVisibility'
import { useDefiChainsQuery } from '@core/ui/storage/defiChains'
import { useDefiPositionsQuery } from '@core/ui/storage/defiPositions'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import {
  queryOptions,
  skipToken,
  useQueries,
  useQueryClient,
} from '@tanstack/react-query'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { useEffect } from 'react'

/**
 * Key for a vault's settled DeFi value not already in its wallet total. It
 * carries the stored DeFi, Circle and currency settings, so a figure computed
 * under other ones is never read back.
 */
const useVaultDefiNotInWalletFiatQueryKey = () => {
  const fiatCurrency = useFiatCurrency()
  const { data: defiChains } = useDefiChainsQuery()
  const { data: defiPositions } = useDefiPositionsQuery()
  const isCircleVisible = useIsCircleVisible()

  return (vaultId: string) =>
    [
      'vaultDefiNotInWalletFiat',
      { vaultId, fiatCurrency, defiChains, defiPositions, isCircleVisible },
    ] as const
}

/** Caches the current vault's settled DeFi value not already in its wallet total; `undefined` leaves the cache as is. */
export const useCacheVaultDefiNotInWalletFiat = (value: number | undefined) => {
  const queryClient = useQueryClient()
  const vaultId = getVaultId(useCurrentVault())
  const getQueryKey = useVaultDefiNotInWalletFiatQueryKey()

  useEffect(() => {
    if (value === undefined) return

    queryClient.setQueryData(getQueryKey(vaultId), value)
  }, [queryClient, getQueryKey, vaultId, value])
}

/**
 * Cached DeFi value not already in the wallet total, per vault id, for vaults
 * whose home total settled this session. Reads the cache only, never fetches.
 */
export const useCachedVaultsDefiNotInWalletFiat = (
  vaultIds: string[]
): Record<string, number> => {
  const getQueryKey = useVaultDefiNotInWalletFiatQueryKey()

  const queries = useQueries({
    queries: vaultIds.map(vaultId =>
      queryOptions<number>({
        queryKey: getQueryKey(vaultId),
        queryFn: skipToken,
      })
    ),
  })

  const result: Record<string, number> = {}
  vaultIds.forEach((vaultId, index) => {
    const { data } = queries[index]
    if (data !== undefined) result[vaultId] = data
  })

  return result
}
