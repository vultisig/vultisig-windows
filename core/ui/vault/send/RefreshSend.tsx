import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { chainSpecificQueryKeyPrefix } from '@core/ui/chain/coin/queries/useChainSpecificQuery'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { RefreshCwIcon } from '@lib/ui/icons/RefreshCwIcon'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

export const RefreshSend = () => {
  const coin = useCurrentSendCoin()
  const invalidateQueries = useInvalidateQueries()

  const { mutate: refresh, isPending } = useMutation({
    mutationFn: () =>
      invalidateQueries(getBalanceQueryKey(extractAccountCoinKey(coin)), [
        chainSpecificQueryKeyPrefix,
      ]),
  })

  return (
    <IconButton loading={isPending} onClick={() => refresh()}>
      <RefreshCwIcon />
    </IconButton>
  )
}
