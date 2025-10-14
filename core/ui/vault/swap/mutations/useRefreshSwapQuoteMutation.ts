import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { QueryKey, useMutation } from '@tanstack/react-query'

import { feeQuoteQueryKeyPrefix } from '../../../chain/feeQuote/query'
import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { swapQuoteQueryKeyPrefix } from '../queries/useSwapQuoteQuery'
import { useFromAmount } from '../state/fromAmount'

export const useRefreshSwapQuoteMutation = () => {
  const invalidateQueries = useInvalidateQueries()

  const [{ coin: fromCoinKey }] = useCoreViewState<'swap'>()
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
        queryKeys.push([feeQuoteQueryKeyPrefix])
      }

      return invalidateQueries(queryKeys)
    },
  })

  return { mutate, isPending, error }
}
