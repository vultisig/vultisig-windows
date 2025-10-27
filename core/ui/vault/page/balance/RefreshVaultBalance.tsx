import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { getCoinPricesQueryKeys } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { IconCalendarClockIcon } from '@lib/ui/icons/IconCalendarClockIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
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
      <IconWrapper size={24}>
        <IconCalendarClockIcon />
      </IconWrapper>
    </IconButton>
  )
}
