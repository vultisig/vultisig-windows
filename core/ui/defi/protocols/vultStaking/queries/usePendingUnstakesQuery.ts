import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useQuery } from '@tanstack/react-query'
import { isAddress } from 'viem'

import { vultStakingChain } from '../core/config'
import { getPendingUnstakes } from '../core/getPendingUnstakes'

export const getPendingUnstakesQueryKey = (ownerAddress: string) =>
  ['vultPendingUnstakes', ownerAddress] as const

/** Outstanding unstake requests for the current vault. */
export const usePendingUnstakesQuery = () => {
  const ownerAddress = useCurrentVaultAddress(vultStakingChain)

  return useQuery({
    queryKey: getPendingUnstakesQueryKey(ownerAddress),
    queryFn: () => getPendingUnstakes({ ownerAddress }),
    enabled: isAddress(ownerAddress),
  })
}
