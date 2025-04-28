import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { getBalanceQueryKey } from '../../coin/query/useBalancesQuery'
import { chainSpecificQueryKeyPrefix } from '../../coin/query/useChainSpecificQuery'
import { PageHeaderRefresh } from '../../ui/page/PageHeaderRefresh'
import { useCurrentSendCoin } from './state/sendCoin'

export const RefreshSend = () => {
  const invalidateQueries = useInvalidateQueries()

  const [coinKey] = useCurrentSendCoin()
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
