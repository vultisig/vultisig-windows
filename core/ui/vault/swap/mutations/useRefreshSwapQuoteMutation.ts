import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { QueryKey, useMutation } from '@tanstack/react-query'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { getSwapQuoteQueryKey } from '../queries/useSwapQuoteQuery'
import { useFromAmount } from '../state/fromAmount'
import { useToCoin } from '../state/toCoin'

export const useRefreshSwapQuoteMutation = () => {
  const invalidateQueries = useInvalidateQueries()

  const [{ coin: fromCoinKey }] = useCoreViewState<'swap'>()
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
