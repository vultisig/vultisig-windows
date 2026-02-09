import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { getCoinPricesQueryKeys } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useCurrentVaultChainCoins } from '@core/ui/vault/state/currentVaultCoins'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { RefreshCwIcon } from '@lib/ui/icons/RefreshCwIcon'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { useMutation } from '@tanstack/react-query'

import { useCurrentVaultChain } from './useCurrentVaultChain'

export const RefreshVaultChainBalance = () => {
  const refetchQueries = useRefetchQueries()

  const chain = useCurrentVaultChain()
  const coins = useCurrentVaultChainCoins(chain)

  const fiatCurrency = useFiatCurrency()

  const { mutate: refresh, isPending } = useMutation({
    mutationFn: () => {
      return refetchQueries(
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
        <RefreshCwIcon />
      </IconWrapper>
    </IconButton>
  )
}
