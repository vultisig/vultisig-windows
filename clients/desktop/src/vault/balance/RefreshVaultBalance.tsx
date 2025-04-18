import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { getBalanceQueryKey } from '../../coin/query/useBalancesQuery'
import { getCoinPricesQueryKeys } from '../../coin/query/useCoinPricesQuery'
import { useFiatCurrency } from '../../preferences/state/fiatCurrency'
import { PageHeaderRefresh } from '../../ui/page/PageHeaderRefresh'
import { useCurrentVaultCoins } from '../state/currentVaultCoins'

export const RefreshVaultBalance = () => {
  const invalidateQueries = useInvalidateQueries()

  const coins = useCurrentVaultCoins()

  const [fiatCurrency] = useFiatCurrency()

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
