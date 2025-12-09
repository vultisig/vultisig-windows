import { Chain } from '@core/chain/Chain'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { useMutation } from '@tanstack/react-query'

import { getCircleAccountQueryKey, getCreateCircleWalletUrl } from '../api'

type CreateCircleWalletBody = {
  idempotency_key: string
  account_type: 'SCA'
  owner: string
  name: string
}

const defaultVaultName = 'my test vault'

export const useOpenCircleAccountMutation = () => {
  const ownerAddress = useCurrentVaultAddress(Chain.Ethereum)
  const invalidateQueries = useInvalidateQueries()

  const circleAccountQueryKey = getCircleAccountQueryKey({
    ownerAddress,
  })

  return useMutation({
    mutationFn: async () => {
      const body: CreateCircleWalletBody = {
        idempotency_key: crypto.randomUUID(),
        account_type: 'SCA',
        owner: ownerAddress,
        name: defaultVaultName,
      }

      await queryUrl(getCreateCircleWalletUrl(), {
        body,
      })

      await invalidateQueries(circleAccountQueryKey)
    },
  })
}
