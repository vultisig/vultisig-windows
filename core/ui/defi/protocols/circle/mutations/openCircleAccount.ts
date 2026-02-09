import { Chain } from '@core/chain/Chain'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { useMutation } from '@tanstack/react-query'

import { openCircleAccount } from '../core/openCircleAccount'
import { getCircleAccountQueryKey } from '../queries/circleAccount'

export const useOpenCircleAccountMutation = () => {
  const ownerAddress = useCurrentVaultAddress(Chain.Ethereum)
  const refetchQueries = useRefetchQueries()

  return useMutation({
    mutationFn: async () => {
      await openCircleAccount(ownerAddress)

      await refetchQueries(getCircleAccountQueryKey({ ownerAddress }))
    },
  })
}
