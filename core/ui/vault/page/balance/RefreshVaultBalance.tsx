import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { usePortfolioVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { RefreshCwIcon } from '@lib/ui/icons/RefreshCwIcon'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { useRefetchQueriesByCategory } from '@lib/ui/query/hooks/useRefetchQueriesByCategory'
import { useMutation } from '@tanstack/react-query'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'

/**
 * Refresh button for the vault page: refetches every portfolio coin's balance
 * and invalidates all price queries by category.
 */
export const RefreshVaultBalance = () => {
  const refetchQueries = useRefetchQueries()
  const refetchQueriesByCategory = useRefetchQueriesByCategory()

  const coins = usePortfolioVaultCoins()

  const { mutate: refresh, isPending } = useMutation({
    mutationFn: () => {
      // Prices are invalidated by category: their keys are per-source subsets
      // (coinPrices, thorchainSecuredAssetPrices, yieldNavPrices, ...), so no
      // single coin-list key can match them all.
      return Promise.all([
        refetchQueriesByCategory('price'),
        refetchQueries(
          ...coins.map(extractAccountCoinKey).map(getBalanceQueryKey)
        ),
      ])
    },
  })

  return (
    <IconButton loading={isPending} onClick={() => refresh()}>
      <IconWrapper size={24}>
        <RefreshCwIcon />
      </IconWrapper>
    </IconButton>
  )
}
