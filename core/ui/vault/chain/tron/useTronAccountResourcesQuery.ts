import { Chain } from '@core/chain/Chain'
import { getTronAccountResources } from '@core/chain/chains/tron/resources'
import { useQuery } from '@tanstack/react-query'

import { useCurrentVaultAddress } from '../../state/currentVaultCoins'

export const useTronAccountResourcesQuery = () => {
  const address = useCurrentVaultAddress(Chain.Tron)

  return useQuery({
    queryKey: ['tronAccountResources', address],
    queryFn: () => getTronAccountResources(address),
  })
}
