import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { chainSpecificQueryKeyPrefix } from '@core/ui/chain/coin/queries/useChainSpecificQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { PageHeaderRefresh } from '@lib/ui/page/PageHeaderRefresh'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { useCurrentSendCoin } from './state/sendCoin'

export const RefreshSend = () => {
  const invalidateQueries = useInvalidateQueries()

  const [{ coin: coinKey }] = useCurrentSendCoin()
  const address = useCurrentVaultAddress(coinKey.chain)

  const { mutate: refresh, isPending } = useMutation({
    mutationFn: () => {
      const accountCoinKey = {
        ...coinKey,
        address,
      }
      return invalidateQueries(getBalanceQueryKey(accountCoinKey), [
        chainSpecificQueryKeyPrefix,
      ])
    },
  })

  return <PageHeaderRefresh onClick={() => refresh()} isPending={isPending} />
}
