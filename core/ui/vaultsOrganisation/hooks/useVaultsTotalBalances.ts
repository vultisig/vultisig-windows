import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { getBalanceQueryOptions } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { withoutKaminoShareCoins } from '@core/ui/chain/coin/solana/isKaminoShareCoin'
import { withoutBondedRuneReceiptCoins } from '@core/ui/chain/coin/thorchain/isBondedRuneReceiptCoin'
import { withoutRujiStakingReceiptCoins } from '@core/ui/chain/coin/thorchain/isRujiStakingReceiptCoin'
import { useVaults } from '@core/ui/storage/vaults'
import { computeVaultTotalValue } from '@core/ui/vaultsOrganisation/utils/computeVaultTotalValue'
import { balanceQueryStaleTime } from '@lib/ui/query/utils/options'
import { useQueries } from '@tanstack/react-query'
import {
  AccountCoin,
  accountCoinKeyToString,
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

/**
 * Fiat total per vault. A vault appears in `totals` once every one of its
 * coins has a balance, so rows fill in one by one and a failed read leaves out
 * only its own vault. Totals spanning several vaults must check that every
 * vault they cover is present.
 */
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
      coins: withoutKaminoShareCoins(
        withoutBondedRuneReceiptCoins(
          withoutRujiStakingReceiptCoins(vault.coins ?? [])
        )
      ),
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
    // balance consumer in the app shares cache. Those base options leave
    // refetch on mount/focus/reconnect off, and that — not the `staleTime`
    // below — is what keeps this screen from fanning out a balance read for
    // every coin of every vault each time it opens; the active-vault
    // surfaces are what keep those cache entries current. `staleTime` is
    // per-observer in TanStack Query, so the shared value is restated here
    // to hold this screen to the same freshness expectation as those
    // surfaces if these observers ever drive a read of their own.
    queries: allCoins.map(coin => ({
      ...getBalanceQueryOptions(extractAccountCoinKey(coin)),
      staleTime: balanceQueryStaleTime,
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

    const prices = priceQuery.data
    if (priceError || priceQuery.isPending || !prices) {
      return undefined
    }

    // Queries still loading contribute nothing to the merged record.
    const mergedBalances = mergeRecords(
      ...balanceQueries.map(query => query.data ?? {})
    )

    const result: Record<string, number> = {}

    vaultCoinEntries.forEach(({ vaultId, coins }) => {
      const hasEveryBalance = coins.every(
        coin =>
          accountCoinKeyToString(extractAccountCoinKey(coin)) in mergedBalances
      )

      if (hasEveryBalance) {
        result[vaultId] = computeVaultTotalValue({
          coins,
          balances: mergedBalances,
          prices,
        })
      }
    })

    return result
  }, [
    balanceQueries,
    enabled,
    priceError,
    priceQuery.data,
    priceQuery.isPending,
    vaultCoinEntries,
  ])

  return {
    totals,
    isPending,
    error,
  }
}
