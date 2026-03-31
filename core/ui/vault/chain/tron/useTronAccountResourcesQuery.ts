import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { getTronAccountResources } from '@vultisig/core-chain/chains/tron/resources'

import { useCurrentVaultAddress } from '../../state/currentVaultCoins'

export const useTronAccountResourcesQuery = () => {
  const address = useCurrentVaultAddress(Chain.Tron)

  return useQuery({
    queryKey: ['tronAccountResources', address],
    queryFn: () => getTronAccountResources(address),
  })
}
