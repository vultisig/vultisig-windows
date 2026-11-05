import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'

import { toTcyRewardHistory } from './services/thorchainStake/tcyRewardHistory'
import { getTcyUserDistributions } from './services/thorchainStake/tcyStakeService'

/** Mounted only by the sheet, so the history loads on open and is never persisted. */
export const useTcyRewardHistoryQuery = () => {
  const address = useCurrentVaultAddress(Chain.THORChain)

  return useQuery({
    queryKey: ['defi', Chain.THORChain, 'tcyRewardHistory', { address }],
    queryFn: async () => {
      const { distributions } = await getTcyUserDistributions(address)
      return toTcyRewardHistory(distributions)
    },
  })
}
