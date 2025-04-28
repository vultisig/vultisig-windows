import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { getCoinPricesQueryKeys } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useFiatCurrency } from '@core/ui/state/fiatCurrency'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { getBalanceQueryKey } from '../../coin/query/useBalancesQuery'
import { PageHeaderRefresh } from '../../ui/page/PageHeaderRefresh'

export const RefreshVaultBalance = () => {
  const invalidateQueries = useInvalidateQueries()

  const coins = useCurrentVaultCoins()

  const fiatCurrency = useFiatCurrency()

  const { mutate: refresh, isPending } = useMutation({
    mutationFn: () => {
      return invalidateQueries(
        getCoinPricesQueryKeys({
          coins,
          fiatCurrency,
        }),
        ...coins.map(extractAccountCoinKey).map(getBalanceQueryKey)
      )
    },
  })

  return <PageHeaderRefresh onClick={() => refresh()} isPending={isPending} />
}
