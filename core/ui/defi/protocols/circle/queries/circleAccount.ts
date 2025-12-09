import { Chain } from '@core/chain/Chain'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useQuery } from '@tanstack/react-query'

import { getCircleAccount } from '../api'

type CircleAccountQueryKeyInput = {
  ownerAddress: string
}

export const getCircleAccountQueryKey = (input: CircleAccountQueryKeyInput) =>
  ['circle-account', input] as const

export const useCircleAccountQuery = () => {
  const ownerAddress = useCurrentVaultAddress(Chain.Ethereum)
  const input = { ownerAddress }
  return useQuery({
    queryKey: getCircleAccountQueryKey(input),
    queryFn: () => getCircleAccount(input.ownerAddress),
  })
}
