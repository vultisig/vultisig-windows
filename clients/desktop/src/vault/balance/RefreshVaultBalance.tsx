import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { getCoinPricesQueryKeys } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { RefreshCwIcon } from '@lib/ui/icons/RefreshCwIcon'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

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

  return (
    <IconButton loading={isPending} onClick={() => refresh()}>
      <RefreshCwIcon />
    </IconButton>
  )
}
