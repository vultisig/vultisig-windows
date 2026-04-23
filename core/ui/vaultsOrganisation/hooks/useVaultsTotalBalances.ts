import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { getBalanceQueryOptions } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useVaults } from '@core/ui/storage/vaults'
import { balanceStaleTimeMs } from '@core/ui/vaultsOrganisation/hooks/balanceStaleTimeMs'
import { computeVaultTotalValue } from '@core/ui/vaultsOrganisation/utils/computeVaultTotalValue'
import { useQueries } from '@tanstack/react-query'
import {
  AccountCoin,
  extractAccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'
import { areEqualCoins } from '@vultisig/core-chain/coin/Coin'
import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'
import { withoutDuplicates } from '@vultisig/lib-utils/array/withoutDuplicates'
import { mergeRecords } from '@vultisig/lib-utils/record/mergeRecords'
import { useMemo } from 'react'

type VaultCoinsEntry = {
  vaultId: string
  coins: AccountCoin[]
}

type UseVaultsTotalBalancesInput = {
  // When provided, scope the fetch to just these vaults rather than every
  // stored vault. Folder/manage screens pass their subset so we avoid firing
  // N x M balance RPCs for vaults the user isn't looking at.
  vaults?: (Vault & { coins: AccountCoin[] })[]
  // When false, skip all price/balance queries entirely. The root vault
  // selection screen flips this off past a size threshold (issue #3785) to
  // avoid the N x M balance RPC fanout that froze the switcher.
  enabled?: boolean
}

export const useVaultsTotalBalances = ({
  vaults: scopedVaults,
  enabled = true,
}: UseVaultsTotalBalancesInput = {}) => {
  const allVaults = useVaults()
  const vaults = scopedVaults ?? allVaults

  const vaultCoinEntries = useMemo<VaultCoinsEntry[]>(() => {
    if (!enabled) return []

    return vaults.map(vault => ({
      vaultId: getVaultId(vault),
      coins: vault.coins,
    }))
  }, [enabled, vaults])

  // Flat list of every (chain, id, address) tuple we need a balance for.
  // Deduplicated via the query cache (`useQueries` + `getBalanceQueryOptions`
  // keys everything by that tuple so repeat coins short-circuit).
  const allCoins = useMemo(
    () => vaultCoinEntries.flatMap(entry => entry.coins),
    [vaultCoinEntries]
  )

  const uniqueCoinsForPrices = useMemo(
    () =>
      withoutDuplicates(allCoins, areEqualCoins).map(coin => ({
        chain: coin.chain,
        id: coin.id,
        priceProviderId: coin.priceProviderId,
      })),
    [allCoins]
  )

  const priceQuery = useCoinPricesQuery({
    coins: uniqueCoinsForPrices,
  })

  const balanceQueries = useQueries({
    // Reuse the exact query keys / persistence meta from
    // `getBalanceQueryOptions` (shared with `useBalancesQuery`) so every
    // balance consumer in the app shares cache. `staleTime` is per-observer
    // in TanStack Query — setting it here only affects refetch behavior for
    // *this* observer, which is exactly what we want: other consumers with
    // their own fresher expectations are unaffected.
    queries: allCoins.map(coin => ({
      ...getBalanceQueryOptions(extractAccountCoinKey(coin)),
      staleTime: balanceStaleTimeMs,
    })),
  })

  const isBalancesPending = balanceQueries.some(query => query.isPending)
  const balancesError = balanceQueries.find(query => query.error)?.error ?? null

  const priceError =
    'error' in priceQuery ? priceQuery.error : (priceQuery.errors[0] ?? null)

  const isPending = enabled && (priceQuery.isPending || isBalancesPending)
  const error = priceError ?? balancesError

  const totals = useMemo(() => {
    if (!enabled) return {}

    if (
      isPending ||
      error ||
      !priceQuery.data ||
      balanceQueries.some(query => !query.data)
    ) {
      return undefined
    }

    // Merge every per-coin balance record into a single lookup matching the
    // shape `computeVaultTotalValue` expects. Each query produces
    // `{ [accountCoinKeyToString(coin)]: amount }`, so the merged record
    // is already keyed consistently for the helper. The `balanceQueries.some`
    // guard above ensures every query has data by the time we reach here, so
    // `mergeRecords` gets a homogeneous `Record<string, bigint>[]`.
    const mergedBalances = mergeRecords(
      ...balanceQueries.map(query => query.data ?? {})
    )

    const result: Record<string, number> = {}

    vaultCoinEntries.forEach(({ vaultId, coins }) => {
      result[vaultId] = computeVaultTotalValue({
        coins,
        balances: mergedBalances,
        prices: priceQuery.data ?? {},
      })
    })

    return result
  }, [
    balanceQueries,
    enabled,
    error,
    isPending,
    priceQuery.data,
    vaultCoinEntries,
  ])

  return {
    totals,
    isPending,
    error,
  }
}
