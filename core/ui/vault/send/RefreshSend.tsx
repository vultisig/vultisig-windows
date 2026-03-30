import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { RefreshCwIcon } from '@lib/ui/icons/RefreshCwIcon'
import { useRefetchQueriesMutation } from '@lib/ui/query/hooks/useRefetchQueriesMutation'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'

export const RefreshSend = () => {
  const coin = useCurrentSendCoin()
  const { mutate: refresh, isPending } = useRefetchQueriesMutation()

  return (
    <IconButton
      loading={isPending}
      onClick={() => {
        refresh([getBalanceQueryKey(extractAccountCoinKey(coin))])
      }}
    >
      <RefreshCwIcon />
    </IconButton>
  )
}
