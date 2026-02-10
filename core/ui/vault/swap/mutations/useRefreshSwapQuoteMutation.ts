import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { QueryKey, useMutation } from '@tanstack/react-query'

import { swapQuoteQueryKeyPrefix } from '../queries/useSwapQuoteQuery'
import { useFromAmount } from '../state/fromAmount'
import { useSwapFromCoin } from '../state/fromCoin'

export const useRefreshSwapQuoteMutation = () => {
  const refetchQueries = useRefetchQueries()

  const [fromCoinKey] = useSwapFromCoin()
  const [fromAmount] = useFromAmount()

  const address = useCurrentVaultAddress(fromCoinKey.chain)

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => {
      const queryKeys: QueryKey[] = [
        getBalanceQueryKey({
          ...fromCoinKey,
          address,
        }),
      ]

      if (fromAmount) {
        queryKeys.push([swapQuoteQueryKeyPrefix])
      }

      return refetchQueries(queryKeys)
    },
  })

  return { mutate, isPending, error }
}
