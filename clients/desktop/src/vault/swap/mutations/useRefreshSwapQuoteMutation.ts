import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { QueryKey, useMutation } from '@tanstack/react-query'

import { getBalanceQueryKey } from '../../../coin/query/useBalancesQuery'
import { getSwapQuoteQueryKey } from '../queries/useSwapQuoteQuery'
import { useFromAmount } from '../state/fromAmount'
import { useFromCoin } from '../state/fromCoin'
import { useToCoin } from '../state/toCoin'

export const useRefreshSwapQuoteMutation = () => {
  const invalidateQueries = useInvalidateQueries()

  const [fromCoinKey] = useFromCoin()
  const [toCoinKey] = useToCoin()
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
        queryKeys.push(
          getSwapQuoteQueryKey({
            fromCoinKey,
            toCoinKey,
            fromAmount,
          })
        )
      }

      return invalidateQueries(queryKeys)
    },
  })

  return { mutate, isPending, error }
}
