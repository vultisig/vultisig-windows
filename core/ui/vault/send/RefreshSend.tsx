import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { RefreshCwIcon } from '@lib/ui/icons/RefreshCwIcon'
import { useInvalidateQueriesMutation } from '@lib/ui/query/hooks/useInvalidateQueriesMutation'

import { feeQuoteQueryKeyPrefix } from '../../chain/feeQuote/query'

export const RefreshSend = () => {
  const coin = useCurrentSendCoin()
  const { mutate: refresh, isPending } = useInvalidateQueriesMutation()

  return (
    <IconButton
      loading={isPending}
      onClick={() => {
        refresh([
          getBalanceQueryKey(extractAccountCoinKey(coin)),
          [feeQuoteQueryKeyPrefix],
        ])
      }}
    >
      <RefreshCwIcon />
    </IconButton>
  )
}
