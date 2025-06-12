import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { chainSpecificQueryKeyPrefix } from '@core/ui/chain/coin/queries/useChainSpecificQuery'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { RefreshCwIcon } from '@lib/ui/icons/RefreshCwIcon'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

export const RefreshSend = () => {
  const [{ coin: coinKey }] = useCurrentSendCoin()
  const invalidateQueries = useInvalidateQueries()
  const address = useCurrentVaultAddress(coinKey.chain)

  const { mutate: refresh, isPending } = useMutation({
    mutationFn: () =>
      invalidateQueries(getBalanceQueryKey({ ...coinKey, address }), [
        chainSpecificQueryKeyPrefix,
      ]),
  })

  return (
    <IconButton loading={isPending} onClick={() => refresh()}>
      <RefreshCwIcon />
    </IconButton>
  )
}
