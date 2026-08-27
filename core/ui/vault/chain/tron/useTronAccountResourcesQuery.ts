import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'

import { useCurrentVaultAddress } from '../../state/currentVaultCoins'
import { getExactTronAccountResources } from './getExactTronAccountResources'

export const getTronAccountResourcesQueryKey = (address: string) =>
  ['tronAccountResources', address] as const

export const useTronAccountResourcesQuery = () => {
  const address = useCurrentVaultAddress(Chain.Tron)

  return useQuery({
    queryKey: getTronAccountResourcesQueryKey(address),
    queryFn: () => getExactTronAccountResources(address),
    enabled: Boolean(address),
  })
}
