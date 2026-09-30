import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import {
  getBalanceQueryKey,
  useBalancesQuery,
} from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { usePortfolioVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import {
  QueryClient,
  useIsRestoring,
  useQueryClient,
} from '@tanstack/react-query'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { useEffect } from 'react'

// Each extension page opening creates a new query client. Keep the guard there
// so StrictMode and vault-provider remounts cannot repeat this opening's refresh.
const refreshedVaults = new WeakMap<QueryClient, Set<string>>()

export const ExtensionPortfolioRefresh = () => {
  const queryClient = useQueryClient()
  const isRestoring = useIsRestoring()
  const vaultId = getVaultId(useCurrentVault())
  const coins = usePortfolioVaultCoins()
  const balanceKeys = coins.map(extractAccountCoinKey)

  // Register the portfolio queries even on settings/other non-portfolio views.
  // The opening effect owns the balance refresh, without adding a new timer.
  useBalancesQuery(balanceKeys, { live: false })
  useCoinPricesQuery({ coins })

  useEffect(() => {
    if (isRestoring || coins.length === 0) return

    const refreshed = refreshedVaults.get(queryClient) ?? new Set<string>()
    if (refreshed.has(vaultId)) return

    refreshed.add(vaultId)
    refreshedVaults.set(queryClient, refreshed)

    // Invalidation preserves restored data on pending/failed reads. Reuse any
    // request already started by a mounted view instead of cancelling it.
    void queryClient.invalidateQueries(
      { predicate: query => query.meta?.category === 'price' },
      { cancelRefetch: false }
    )
    balanceKeys.forEach(coin => {
      void queryClient.invalidateQueries(
        { queryKey: getBalanceQueryKey(coin), exact: true },
        { cancelRefetch: false }
      )
    })
  }, [balanceKeys, coins.length, isRestoring, queryClient, vaultId])

  return null
}
