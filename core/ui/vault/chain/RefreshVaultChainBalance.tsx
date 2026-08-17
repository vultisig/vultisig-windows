import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useCurrentVaultChainCoins } from '@core/ui/vault/state/currentVaultCoins'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { RefreshCwIcon } from '@lib/ui/icons/RefreshCwIcon'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { useRefetchQueriesByCategory } from '@lib/ui/query/hooks/useRefetchQueriesByCategory'
import { useMutation } from '@tanstack/react-query'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'

import { useCurrentVaultChain } from './useCurrentVaultChain'

/**
 * Refresh button for a chain page: refetches the chain's coin balances and
 * invalidates all price queries by category.
 */
export const RefreshVaultChainBalance = () => {
  const refetchQueries = useRefetchQueries()
  const refetchQueriesByCategory = useRefetchQueriesByCategory()

  const chain = useCurrentVaultChain()
  const coins = useCurrentVaultChainCoins(chain)

  const { mutate: refresh, isPending } = useMutation({
    mutationFn: () => {
      // Prices are global and invalidated by category; see RefreshVaultBalance.
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
