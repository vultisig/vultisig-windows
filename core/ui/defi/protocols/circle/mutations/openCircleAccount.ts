import { Chain } from '@core/chain/Chain'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { openCircleAccount } from '../api'
import { getCircleAccountQueryKey } from '../queries/circleAccount'

export const useOpenCircleAccountMutation = () => {
  const ownerAddress = useCurrentVaultAddress(Chain.Ethereum)
  const invalidateQueries = useInvalidateQueries()

  return useMutation({
    mutationFn: async () => {
      await openCircleAccount(ownerAddress)

      await invalidateQueries(getCircleAccountQueryKey({ ownerAddress }))
    },
  })
}
